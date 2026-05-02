import redis from "../config/redisConnect.js";
import { Queue } from "bullmq";
import { errorResponse } from "../utils/responses.js";



// create a BullMQ queue for sending emails
const emailQueue = new Queue(
    `${process.env.PROJECT_NAME}_${process.env.NODE_ENV}_emailQueue`,
    {
        connection: redis,
        defaultJobOptions: {
            attempts: 1,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        }
    }
);

// function to add email sending job to the queue
// emailData should be an object like { to, subject, html }
// jobName is a string that identifies the type of email (e.g., "welcomeEmail", "passwordResetEmail")
async function addEmailJobToQueue(jobName, emailData) {
    try {
        // Validate emailData
        if (!emailData.to || !emailData.subject || !emailData.html) {
            console.error(
                "Invalid email data provided to addEmailJob:",
                JSON.stringify(emailData, null, 2)
            );
            return false; // or throw an error if you want to enforce strict validation
        }
        await emailQueue.add(jobName, emailData);
        
        return true;
    } catch (error) {
        console.error("Error adding email job to the queue:", error);
        return false;
    }
}

export { addEmailJobToQueue };