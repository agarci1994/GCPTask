require('dotenv')

// const MAX_SCHEDULE_LIMIT = 30 * 60 * 60 * 24; // Represents 30 days in seconds.
const project = process.env.PROYECT_NAME
const location = process.env.QUEUE_LOCATION
const name = process.env.QUEUE_NAME
const url = process.env.FUNCTION_URL
const email = process.env.SERVICE_ACCOUNT_EMAIL

const createHttpTaskWithToken = async (
    payload = {key: 2, manolo: "pedro"},
    date = new Date()
) => {

    // Imports the Google Cloud Tasks library.
    const {
        CloudTasksClient
    } = require('@google-cloud/tasks');
    
    // Instantiates a client.
    const client = new CloudTasksClient();
    
    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, name);
    

    // Convert message to buffer.
    const convertedPayload = JSON.stringify(payload);
    const body = Buffer.from(convertedPayload).toString('base64');

    const task = {
        httpRequest: {
            httpMethod: 'POST',
            url,
            oidcToken: {
                serviceAccountEmail: email,
            },
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        },
    };

    // const convertedDate = new Date(date);
    // const currentDate = new Date();

    // // Schedule time can not be in the past.
    // if (convertedDate < currentDate) {
    //     console.error('Scheduled date in the past.');
    // } else if (convertedDate > currentDate) {
    //     const date_diff_in_seconds = (convertedDate - currentDate) / 1000;
    //     // Restrict schedule time to the 30 day maximum.
    //     if (date_diff_in_seconds > MAX_SCHEDULE_LIMIT) {
    //         console.error('Schedule time is over 30 day maximum.');
    //     }
    //     // Construct future date in Unix time.
    //     const date_in_seconds =
    //         Math.min(date_diff_in_seconds, MAX_SCHEDULE_LIMIT) + Date.now() / 1000;
    //     // Add schedule time to request in Unix time using Timestamp structure.
    //     // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
    //     task.scheduleTime = {
    //         seconds: date_in_seconds,
    //     };
    // }

    try {
        // Send create task request.
        const [response] = await client.createTask({
            parent,
            task
        });
        console.log(`Created task ${response.name}`);
        return response.name;
    } catch (error) {
        // Construct error for Stackdriver Error Reporting
        console.error(Error(error.message));
    }
};

module.exports = createHttpTaskWithToken;