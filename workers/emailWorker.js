import nodemailer from "nodemailer";
import redis from "../config/redisConnect.js";
import { Worker } from "bullmq";
import { errorResponse } from "../utils/responses.js";

// configure Nodemailer transporter for Office365
// create a nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    pool: true, // Use SMTP pooling to keep the connection open for multiple emails
    auth: {
        user: process.env.AUTH_EMAIL, // Replace with your Mailtrap username
        pass: process.env.AUTH_PASS  // Replace with your Mailtrap password
    },
    tls: {
        ciphers: "TLSv1.2",   // ensure modern TLS version
        rejectUnauthorized: false, // only if you have certificate issues
    },
    maxMessages: 100, // Allow an 100 number of messages per connection
    maxConnections: 3 // Limit the number of simultaneous connections
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter error:", error);
    } else {
        console.log("Email transporter ready ✅");
    }
});

// create a BullMQ worker to process email sending jobs
const emailWorker = new Worker(
    `${process.env.PROJECT_NAME}_${process.env.NODE_ENV}_emailQueue`,
    async (job) => {
        try {
            const { email, subject, html } = job.data;

            await transporter.sendMail({
                from: process.env.AUTH_EMAIL, // sender address
                to: job.data.email, // list of receivers
                subject, // Subject line
                html, // html body
            });
        } catch (error) {
            console.error("Error processing email job:", error);
            throw error; // rethrow to let BullMQ handle retries
        }
    },
    {
        connection: redis,
        concurrency: 3, // Process up to 3 email jobs simultaneously
    }
);

emailWorker.on("completed", (job) => {
    console.log(`Email sent to ${job.data.email}`);
});

emailWorker.on("failed", (job, err) => {
    console.error(`Failed email to ${job?.data?.email}`, err);
});

export { emailWorker };