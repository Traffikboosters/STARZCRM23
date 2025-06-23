import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, parseISO, isToday, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import traffikBoostersLogo from "@assets/newTRAFIC BOOSTERS3 copy_1750608395971.png";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: "consultation" | "demo" | "strategy" | "follow-up";
  available: boolean;
}

interface BookingForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  serviceType: string;
  message: string;
  preferredDate: string;
  preferredTime: string;
}

interface EmbeddableCalendarProps {
  apiBaseUrl?: string;
  primaryColor?: string;
  companyName?: string;
  companyLogo?: string;
  timeZone?: string;
  businessHours?: {
    start: string;
    end: string;
    days: string[];
  };
  services?: Array<{
    id: string;
    name: string;
    duration: number;
    description: string;
  }>;
}

export default function EmbeddableCalendarWidget({
  apiBaseUrl = "",
  primaryColor = "#e45c2b",
  companyName = "Traffik Boosters",
  companyLogo = traffikBoostersLogo,
  timeZone = "America/New_York",
  businessHours = {
    start: "09:00",
    end: "18:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  },
  services = [
    { id: "consultation", name: "Free Growth Consultation", duration: 30, description: "Discover opportunities to boost your website traffic" },
    { id: "demo", name: "Strategy Demo", duration: 60, description: "See our proven traffic generation strategies in action" },
    { id: "audit", name: "Website Audit Review", duration: 45, description: "Get a comprehensive analysis of your current traffic" },
    { id: "strategy", name: "Custom Strategy Session", duration: 90, description: "Develop a personalized traffic growth plan" }
  ]
}: EmbeddableCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [step, setStep] = useState<"calendar" | "time" | "form" | "confirmation">("calendar");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    serviceType: "",
    message: "",
    preferredDate: "",
    preferredTime: ""
  });

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  
  // Get calendar grid (including padding days)
  const startDate = new Date(start);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const endDate = new Date(end);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Generate available time slots for selected date
  useEffect(() => {
    if (selectedDate && selectedService) {
      generateAvailableSlots(selectedDate);
    }
  }, [selectedDate, selectedService]);

  const generateAvailableSlots = (date: Date) => {
    const dayName = format(date, "EEEE");
    
    // Check if day is in business hours
    if (!businessHours.days.includes(dayName)) {
      setAvailableSlots([]);
      return;
    }

    const slots: string[] = [];
    const startHour = parseInt(businessHours.start.split(":")[0]);
    const endHour = parseInt(businessHours.end.split(":")[0]);
    
    // Generate 30-minute slots
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    
    // Filter out past slots for today
    const now = new Date();
    if (isSameDay(date, now)) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const filteredSlots = slots.filter(slot => {
        const [hour, minute] = slot.split(":").map(Number);
        return hour > currentHour || (hour === currentHour && minute > currentMinute + 30);
      });
      
      setAvailableSlots(filteredSlots);
    } else {
      setAvailableSlots(slots);
    }
  };

  const handleDateSelect = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date >= today) {
      setSelectedDate(date);
      setStep("time");
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingForm(prev => ({
      ...prev,
      preferredDate: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
      preferredTime: time,
      serviceType: selectedService
    }));
    setStep("form");
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setBookingForm(prev => ({ ...prev, serviceType: serviceId }));
    if (selectedDate) {
      generateAvailableSlots(selectedDate);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/calendar/book-appointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...bookingForm,
          source: "traffikboosters.com",
          timezone: timeZone
        }),
      });

      if (response.ok) {
        setStep("confirmation");
      } else {
        throw new Error("Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("There was an error booking your appointment. Please try again or call us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dayName = format(date, "EEEE");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date >= today && businessHours.days.includes(dayName);
  };

  const getServiceById = (id: string) => services.find(s => s.id === id);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <img 
          src={companyLogo} 
          alt={companyName} 
          className="h-16 w-auto mx-auto mb-4"
        />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Schedule Your Free Growth Consultation
        </h2>
        <p className="text-lg text-gray-600">
          Book a call with our traffic experts and discover how to boost your website traffic
        </p>
      </div>

      {step === "calendar" && (
        <div className="space-y-6">
          {/* Service Selection */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Choose Your Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card 
                  key={service.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedService === service.id ? "ring-2 ring-orange-500" : ""
                  )}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{service.name}</h4>
                      <Badge variant="secondary">{service.duration} min</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {selectedService && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Select a Date</h3>
              
              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  {format(currentDate, "MMMM yyyy")}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  const isAvailable = isDateAvailable(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  return (
                    <Button
                      key={index}
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "h-12 p-1 text-sm",
                        !isCurrentMonth && "text-gray-300",
                        isToday(day) && "bg-orange-100",
                        !isAvailable && "opacity-40 cursor-not-allowed",
                        isSelected && "bg-orange-500 text-white"
                      )}
                      disabled={!isAvailable}
                      onClick={() => handleDateSelect(day)}
                    >
                      {format(day, "d")}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "time" && selectedDate && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={() => setStep("calendar")}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h3 className="text-xl font-semibold">
                Select Time - {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              <p className="text-sm text-gray-600">
                {getServiceById(selectedService)?.name} ({getServiceById(selectedService)?.duration} minutes)
              </p>
            </div>
          </div>

          {availableSlots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant="outline"
                  className="p-3 hover:bg-orange-50 hover:border-orange-500"
                  onClick={() => handleTimeSelect(slot)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {slot}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No available slots for this date.</p>
              <Button variant="outline" onClick={() => setStep("calendar")} className="mt-4">
                Choose Different Date
              </Button>
            </div>
          )}
        </div>
      )}

      {step === "form" && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" onClick={() => setStep("time")}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h3 className="text-xl font-semibold">Complete Your Booking</h3>
              <p className="text-sm text-gray-600">
                {selectedDate && format(selectedDate, "EEEE, MMMM d")} at {selectedTime} ({getServiceById(selectedService)?.name})
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={bookingForm.name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={bookingForm.email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={bookingForm.phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={bookingForm.company}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, company: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://"
                value={bookingForm.website}
                onChange={(e) => setBookingForm(prev => ({ ...prev, website: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="message">What are your main traffic goals? (Optional)</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="Tell us about your current traffic challenges and what you'd like to achieve..."
                value={bookingForm.message}
                onChange={(e) => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? "Booking..." : "Confirm Appointment"}
            </Button>
          </form>
        </div>
      )}

      {step === "confirmation" && (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              Your {getServiceById(selectedService)?.name} is scheduled for:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg inline-block">
              <p className="font-semibold">
                {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>📧 A confirmation email has been sent to {bookingForm.email}</p>
            <p>📞 We'll call you at {bookingForm.phone}</p>
            <p>⏰ Please join 5 minutes early</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Need to reschedule?</strong> Call us at (877) 840-6250 or reply to your confirmation email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}