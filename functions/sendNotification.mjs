import currentTime from "./currentTime.mjs";
import fetch from "node-fetch";

/**
 * Posts notification to FCM.
 * @param {string} title Notification title
 * @param {string} body  Notification body
 * @param {string} topic Notification topic
 */
export default function sendNotification(title, body, data, topic,) {
    const key = "LoginSecret";
    const url = "https://fcm.googleapis.com/fcm/send";

    if(!topic) topic = "maintenance";
    
    const notification = {
        title: title,
        body: body,
        data: data,
    };
    
    const message = {
        to: `/topics/${topic}`,
        notification: notification  
    };
    
    const options = {
        method: "POST",
        headers: {
            "Authorization": `key=${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    };

    fetch(url, options)
    .then(response => {
        if(!response.ok) console.log("Network response failed for ", title);
        console.log(`Successfully sent notification to topic ${topic} at ${currentTime()}`);
    }).catch(e => {console.error("Error sending notification:", e)});
}