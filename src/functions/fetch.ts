import { filterEvents } from "./sort.js"
import handleError from "./error.js"
import fetch from "node-fetch"

const api = "http://10.212.174.46/api/"
const testapi = "http://10.212.174.46/api/"

/**
 * Fetches api and returns events
 * 
 * @see handleError(...)    Schedule notifications instantly
 * 
 * @returns Events
 */
export default async function fetchEvents(): Promise<EventProps[]> {
    try {
        // Fetches events
        // const response = await fetch(`${api}events`)

        // Test API
        const response = await fetch(`${testapi}events`)

        // Turns the text response into a JSON object
        const events = await response.json() as EventProps[]

        // Handles case where the response is recieved, but undefined.
        if (!events) {
            handleError({file: "fetch", error: "Event response from API is undefined"})
            return []
        }

        // Returns events if everything has successfull
        return events

    // Catches and handles unknown errors
    } catch (error: any) {
        handleError({file: "fetchEvents", error})
        return []
    }
}

/**
 * Fetches api and returns events
 * 
 * @see handleError(...)    Schedule notifications instantly
 * 
 * @returns Events
 */
export async function fetchAds(): Promise<AdProps[]> {
    try {
        // Fetches events
        // const response = await fetch(`${api}jobs`)

        // Test API
        const response = await fetch(`${testapi}jobs`)

        // Turns the text response into a JSON object
        const ads = await response.json() as AdProps[]

        // Handles case where the response is recieved, but undefined.
        if (!ads) {
            handleError({file: "fetch", error: "Ad response from API is undefined"})
            return []
        }

        // Returns events if everything has successfull
        return ads

    // Catches and handles unknown errors
    } catch (error: any) {
        handleError({file: "fetch", error})
        return []
    }
}

/**
 * Fetches the specific event page for additional details
 * 
 * @param {object} event    Event to fetch details for
 * 
 * @see handleError(...)    Notifies maintenance team of any error
 * 
 * @returns All details for passed event
 */
export async function fetchEventDetails(event: EventProps) {
    // Prod API
    // const response = await fetch(`${api}events/${event.eventID}`)

    // Test API
    const response = await fetch(`${testapi}events/${event.eventID}`)
    const eventDetails = await response.json() as DetailedEventProps

    // Handles error where details are not available
    if (!eventDetails) return handleError({
        file: "fetchEventDetails", 
        error: `Event ${event} has undefined details`
    })
    
    // Returns the event as an object, with details attached
    return {...event, ...eventDetails}
}

/**
 * Fetches the specific event page for additional details
 * 
 * @param {object} event    Event to fetch details for
 * 
 * @see handleError(...)    Notifies maintenance team of any error
 * 
 * @returns All details for passed event
 */
export async function fetchAdDetails(ad: AdProps) {
    // Prod API
    // const response = await fetch(`${api}jobs/${event.eventID}`)

    // Test API
    const response = await fetch(`${testapi}jobs/${ad.id}`)
    const adDetails = await response.json() as DetailedAd

    // Handles error where details are not available
    if (!adDetails) return handleError({
        file: "fetchEventDetails", 
        error: `Event ${event} has undefined details`
    })
    
    // Returns the event as an object, with details attached
    return {...ad, ...adDetails}
}

/**
 * Calls fetchEventDetails for each event to map out all details to be monitored 
 * 
 * @param {object} unfiltered   Boolean option for unfiltered
 * 
 * @see fetchEventDetails(...)  Fetches details for each event
 * @see filterEvents()       Filters events based on their properties
 * @see fetchEvents()        Fetches all events
 * @see handleError(...)        Notifies the maintenance team of any error
 * 
 * @returns All events with all details
 */
export async function detailedEvents(unfiltered?: boolean): Promise<DetailedEventProps[]> {

    // Option to return unfiltered events
    if (unfiltered) {
        const events = await fetchEvents()
        const detailedEvents = await Promise.all(events.map(fetchEventDetails)) as DetailedEventProps[]
        
        if (!detailedEvents) {
            handleError({file: "detailedEvents", error: "detailedEvents is undefined"})
            return []
        }

        console.log("Fetched details for all events unfiltered successfully.")
        return detailedEvents
    }

    const events = await filterEvents()
    const detailedEvents = await Promise.all(events.map(fetchEventDetails)) as DetailedEventProps[]
   
    if (!detailedEvents) {
        handleError({file: "detailedEvents", error: "detailedEvents is undefined"})
        return []
    }

    console.log("Fetched details for all events successfully.")
    return detailedEvents
}

/**
 * Function for fetching a emoji to include in a string.
 * 
 * @param {object} event Event object
 * 
 * @returns {string} Emoji
 */
export function fetchEmoji(event: EventProps): string {
    switch ((event.category).toLowerCase()) {
      case 'tekkom':        return '🍕'
      case 'karrieredag':   return '👩‍🎓'
      case 'cft':           return '🧑‍💻'
      case 'fadderuka':     return '🍹'
      case 'social':        return '🥳'
      case 'bedpres':       return '👩‍💼'
      case 'login':         return '🚨'
      default:              return '💻'
    }
}

/**
 * Returns the time till an event in seconds
 * 
 * @param {event} event Event to get the time for
 * 
 * @see summertime()    Returns if the current time is summertime or wintertime
 * 
 * @returns {number} Seconds till event
 */
export function timeToEvent (event: EventProps): number {
    // Current full date
    const currentTime = new Date()

    // Converting from string to date old and correct version
    const eventTime = new Date(event.startt)

    // Subtracting and dividing from milliseconds to seconds
    const seconds = (eventTime.getTime() - currentTime.getTime()) / 1000

    // Checks for and subtracts two hours during summertime
    if (summertime()) return seconds - 9800

    // Otherwise subtracts one hour during wintertime
    else              return seconds - 7200
} 

/**
 * Checks for summertime
 * 
 * @returns {boolean} True if summertime otherwise false
 */
export function summertime(): boolean {
    // Date object for March 1st
    const date = new Date('2023-03-01')

    // Time zone offset in minutes
    const offset = date.getTimezoneOffset()

    // True if summertime
    if (offset < 0) return true

    // False if wintertime
    else            return false
}
