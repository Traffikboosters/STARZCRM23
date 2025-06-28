import { db } from "./db";
import { technicalProjects, technicalTasks, timeEntries } from "@shared/schema";

async function seedTechnicalData() {
  console.log("Seeding technical data...");

  // Create sample technical projects
  const projects = await db.insert(technicalProjects).values([
    {
      clientName: "Metro HVAC Solutions",
      projectType: "SEO",
      status: "In Progress",
      priority: "High",
      assignedTo: "Sarah Chen",
      dueDate: new Date("2025-07-15"),
      progress: 65,
      description: "Complete SEO optimization for local HVAC company including keyword research, on-page optimization, and local citation building",
      budget: 8500,
      timeSpent: 45,
      estimatedHours: 70,
      createdBy: 1
    },
    {
      clientName: "Precision Plumbing Co",
      projectType: "Web Development",
      status: "Planning",
      priority: "Medium",
      assignedTo: "Mike Rodriguez",
      dueDate: new Date("2025-08-20"),
      progress: 15,
      description: "Custom WordPress website development with booking system and service area mapping",
      budget: 12000,
      timeSpent: 12,
      estimatedHours: 80,
      createdBy: 1
    },
    {
      clientName: "Elite Electrical Services",
      projectType: "Both",
      status: "Completed",
      priority: "High",
      assignedTo: "David Chen",
      dueDate: new Date("2025-06-30"),
      progress: 100,
      description: "Full website redesign with comprehensive SEO strategy implementation",
      budget: 15000,
      timeSpent: 95,
      estimatedHours: 90,
      createdBy: 1
    }
  ]).returning();

  console.log(`Created ${projects.length} technical projects`);

  // Create sample technical tasks
  const tasks = await db.insert(technicalTasks).values([
    // Tasks for Metro HVAC Solutions project
    {
      projectId: projects[0].id,
      title: "Keyword Research & Analysis",
      type: "SEO",
      status: "Completed",
      assignedTo: "Sarah Chen",
      estimatedHours: 8,
      actualHours: 7,
      priority: "High",
      dueDate: new Date("2025-07-02"),
      notes: "Completed comprehensive keyword analysis for HVAC services",
      createdBy: 1
    },
    {
      projectId: projects[0].id,
      title: "On-Page SEO Optimization",
      type: "SEO",
      status: "In Progress",
      assignedTo: "Sarah Chen",
      estimatedHours: 15,
      actualHours: 12,
      priority: "High",
      dueDate: new Date("2025-07-10"),
      notes: "Optimizing meta tags, headers, and content structure",
      createdBy: 1
    },
    // Tasks for Precision Plumbing project
    {
      projectId: projects[1].id,
      title: "Website Wireframe Design",
      type: "Design",
      status: "Completed",
      assignedTo: "Mike Rodriguez",
      estimatedHours: 12,
      actualHours: 10,
      priority: "Medium",
      dueDate: new Date("2025-07-25"),
      notes: "Client approved wireframes with minor revisions",
      createdBy: 1
    },
    {
      projectId: projects[1].id,
      title: "WordPress Development Setup",
      type: "Development",
      status: "Pending",
      assignedTo: "Mike Rodriguez",
      estimatedHours: 20,
      actualHours: 0,
      priority: "Medium",
      dueDate: new Date("2025-08-05"),
      notes: "Setting up WordPress environment and custom theme",
      createdBy: 1
    }
  ]).returning();

  console.log(`Created ${tasks.length} technical tasks`);

  // Create sample time entries
  const entries = await db.insert(timeEntries).values([
    {
      taskId: tasks[0].id,
      userId: 1,
      hours: 4,
      description: "Initial keyword research and competitor analysis",
      date: new Date("2025-06-28"),
      billableRate: 85
    },
    {
      taskId: tasks[0].id,
      userId: 1,
      hours: 3,
      description: "Finalizing keyword list and search volume analysis",
      date: new Date("2025-06-29"),
      billableRate: 85
    },
    {
      taskId: tasks[1].id,
      userId: 1,
      hours: 6,
      description: "Optimizing homepage meta tags and content",
      date: new Date("2025-07-01"),
      billableRate: 85
    }
  ]).returning();

  console.log(`Created ${entries.length} time entries`);
  console.log("Technical data seeding completed successfully");
}

// Run the seeding function
seedTechnicalData().catch(console.error);