import type { Express } from "express";

export function registerDashboardRoutes(app: Express, authMiddleware: any) {
  // Get dashboard data for authenticated user
  app.get('/api/dashboard', authMiddleware, async (req: any, res) => {
    try {
      // Return demo data for the dashboard
      const mockDashboardData = {
        recentSearches: [
          {
            id: 1,
            searchQuery: "Toyota Supra MK4 1998",
            destination: "australia",
            vehicleData: {
              make: "Toyota",
              model: "Supra",
              year: 1998,
              price: "$45,000",
              eligible: true
            },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            searchQuery: "Nissan Skyline GT-R R34",
            destination: "usa",
            vehicleData: {
              make: "Nissan",
              model: "Skyline GT-R",
              year: 2002,
              price: "$80,000",
              eligible: true
            },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            searchQuery: "Honda NSX Type-R",
            destination: "canada",
            vehicleData: {
              make: "Honda",
              model: "NSX Type-R",
              year: 1995,
              price: "$120,000",
              eligible: true
            },
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        savedReports: [
          {
            id: 1,
            title: "Toyota Supra MK4 Analysis",
            searchQuery: "Toyota Supra 1998",
            destination: "australia",
            reportType: "lookup",
            vehicleData: {
              make: "Toyota",
              model: "Supra",
              year: 1998,
              price: "$45,000",
              eligible: true
            },
            isBookmarked: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            title: "Nissan Skyline GT-R R34 Import",
            searchQuery: "Nissan Skyline GT-R R34",
            destination: "usa",
            reportType: "compliance",
            vehicleData: {
              make: "Nissan",
              model: "Skyline GT-R",
              year: 2002,
              price: "$80,000",
              eligible: true
            },
            isBookmarked: false,
            createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        savedJourneys: [
          {
            id: 1,
            vehicleData: {
              make: "Mitsubishi",
              model: "Evolution IX",
              year: 2006,
              price: "$35,000"
            },
            destinationCountry: "australia",
            savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            vehicleData: {
              make: "Subaru",
              model: "Impreza WRX STI",
              year: 2004,
              price: "$28,000"
            },
            destinationCountry: "uk",
            savedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        subscription: {
          id: 1,
          plan: "starter",
          status: "active",
          currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          cancelAtPeriodEnd: false
        }
      };

      res.json(mockDashboardData);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ message: 'Failed to load dashboard data' });
    }
  });
}