import automatedNotifications from "./automatedNotifications.js"
import slowMonitored from "./slowMonitored.js"
import { writeFile } from "./functions/file.js"
import { startTime } from "./data/info.js"

/**
 * Test function for the repository. Will run for 5 minutes then put the
 * repository into production if no errors are found.
 * 
 * @see automatedNotifications()    Main entry point of application, running every minute
 * @see slowMonitored()             Entry point for events that does not need to be checked often
 * @see writeFile()                 Writes given content to given file
 */
export default async function test() {
    // Defines test count
    let testCount = 0

    // Writes start time to file
    const time = new Date()
    const hoursToUTC = time.getTimezoneOffset() / 60

    time.setHours(hoursToUTC < 0 
        ? time.getHours() + Math.abs(hoursToUTC)
        : time.getHours() + hoursToUTC
    )

    // Writes startTime to file
    const content = `const startTime = "${time.toISOString()}"\n\nconst stable = false\n\nexport { startTime, stable }\n`
    writeFile({fileName: "info", content, removeBrackets: true})

    // Runs the two entry points of the application 5 times to ensure stability
    do {
        // Runs main application entry points
        automatedNotifications()
        slowMonitored()

        // Increases count
        testCount++
    
        // Times out for 1 minute between each run to ensure stability
        await new Promise(resolve => setTimeout(resolve, 60000))

    // Runs 5 times before continuing
    } while (testCount < 5)

    // Sets stable as true as it has run both functions 5 times without issues.
    const stableContent = `const startTime = "${startTime}"\nconst stable = true\nexport { startTime, stable }\n`
    writeFile({fileName: "info", content: stableContent, removeBrackets: true})

    // Logs success
    console.log("No errors found. Putting repository into production.")
}

test()
