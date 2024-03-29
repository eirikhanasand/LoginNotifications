import notifyNewEntry, { notifyLinkFound, notifyNewWithLink } from "./notify.js"
import fetchEvents, { timeToEvent } from "./fetch.js"
import joinlink from "./joinlink.js"
import handleError from "./error.js"
import { readFile } from "./file.js"

type sortEventsProps = {
    events: DetailedEventProps[]
    notify?: boolean
}

type SortedObject = {
    slow: DetailedEventProps[], 
    notified: DetailedEventProps[]
}

/**
 * Function for sorting events from API into their seperate categories
 * 
 * @param events Events to sort
 * @param notify Option to notify end user
 * 
 * @see notifyNewWithLink(...)  Notifies the end user of a new event with a joinlink available
 * @see notifyNewEntry(...)     Notifies the end user of a new event
 * @see timeToEvent(...)        Returns the time to the event
 * 
 * @returns Events and slowevents as objects
 */
export default function sortEvents({events, notify}: sortEventsProps): SortedObject {
    // Defines empty arrays
    const slow: DetailedEventProps[] = [], notified: DetailedEventProps[] = []

    // Returns if there are no events to sort
    if (!events || !events.length) {
        console.log("Nothing to sort.")
        return { slow: [], notified: [] }
    }

    // Goes through each event
    events.forEach(event => {
        // Checks if event contains a joinlink
        if (joinlink(event)) {

            // If the user should be notified, notifies the user
            if (notify) notifyNewWithLink(event) 

            // Pushes the event to the slowmonitored array
            slow.push(event)
        
        // If the event does not contain a joinlink, pushes it to the notified array
        } else {

            // Event is far away, console log when it will be added and return
            if (timeToEvent(event) > 1209600) return console.log("Event", event.eventID, "will be added in", Number((timeToEvent(event)-1209600).toFixed(0)), "seconds.")
            
            // If the user should be notified, notifies the user
            if (notify) notifyNewEntry(event)

            // Pushes the event to the notified array
            notified.push(event)
        }
    })

    // Returns the sorted object
    return { slow: slow, notified: notified }
}

/**
 * Function for checking notifiedEvents for joinlink and if so move them to slowMonitored.txt
 * 
 * @param events Events to check
 * @param notify Option to notify the user that the joinlink is found
 * 
 * @see notifyLinkFound(...)    Notifies the user that a link has been found for an already existing event
 * @see joinlink(...)           Fetches the joinlink for an event
 * 
 * @returns Events that need to go to slowMonitored.txt
 */
export function sortNotified({events, notify}: sortEventsProps) {
    // Defines array for events to be slowmonitored
    const slow: DetailedEventProps[] = []

    // Returns a empty array if there are no events to sort
    if (!events || !events.length) return []

    // Goes through each event
    events.forEach(event => {
        // If the user should be notified, notifies the user
        if (notify) notifyLinkFound(event)

        // Pushes the event to the notified array
        slow.push(event)
    })

    // Returns the array
    return slow
}

/**
 * Function for comparing events with slowevents and removing events that are already slowmonitored
 * 
 * @see fetchEvents()       Fetches event from API
 * @see handleError(...)    Handles any error that occurs
 * @see readFile(...)       Reads from given file
 * 
 * @returns                 Filtered object
 */
export async function filterEvents(): Promise<EventProps[]> {
    try {
        // Fetches events
        const events = await fetchEvents()

        // Fetches slow monitored events (events where changes are unlikely)
        const slowEvents = await readFile("slow") as DetailedEventProps[]
        
        // Filters events to avoid multiples of the same event 
        const filteredEvents = slowEvents.length ? events.filter(event => !slowEvents.some(slowevents => slowevents.eventID === event.eventID)):events

        // Handles error where the filtered events are undefined
        if (!filteredEvents) {
            handleError({
                file: "filterEvents", 
                error: "filteredEvents is undefined"
            })
            return []
        }
        // returns filtered events
        return filteredEvents
    
    // Catches and handles any unknown errors
    } catch (error) {
        handleError({file: "filterEvents", error: JSON.stringify(error)})
        return []
    }
}
