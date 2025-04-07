
// This file is kept for backward compatibility
// It re-exports all functions from the new modular structure
import { bookingService as modularbookingService } from "./booking";

export const bookingService = modularbookingService;
