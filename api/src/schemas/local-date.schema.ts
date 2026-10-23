import { z } from 'zod'
import { CHECK_IN_ISSUES } from '../constants/check-in.constant'
import { isPlausibleLocalDate } from '../utils/date'

// Evaluated at parse time so the window follows the server clock.
export const localDateSchema = z.iso
  .date()
  .refine((localDate) => isPlausibleLocalDate(localDate, new Date()), {
    message: CHECK_IN_ISSUES.LOCAL_DATE_OUT_OF_RANGE,
  })
