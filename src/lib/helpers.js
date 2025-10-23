import { isFuture } from "date-fns/isFuture";
import { isPast } from "date-fns/isPast";
import { isToday } from "date-fns/isToday";

/**
 * @param {Date | null} startTime
 * @param {Date | null} endTime
 *
 * @returns {TournamentStatus}
 */
export function inferStatusFromTime(startTime, endTime) {
    // todo: what about "ends today"
    return startTime != null
        ? isFuture(startTime)
            ? "upcoming"
            : endTime == null
            ? isToday(startTime)
                ? "ongoing" // "starts today"
                : "ongoing"
            : isPast(endTime)
            ? "complete"
            : "ongoing"
        : "upcoming"; // "upcoming (no date set)"
}
