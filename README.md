# SEO Meta Tag Analyzer

A powerful SEO analysis tool that provides instant Google and social media previews with an intuitive, Notion-inspired interface.

## 🔗 Demo

Check out the live demo: [SEO Meta Tag Analyzer](https://seo-scanner-interactive.replit.app/)

![SEO Meta Tag Analyzer Screenshot](./attached_assets/screenshot-1743926373225.png)

## 🌟 Features

- **Instant Website Analysis**: Analyze any website's SEO metrics with a single URL input
- **Google Search Preview**: See how your website appears in Google search results
- **Social Media Preview**: Visualize how your website looks when shared on social platforms
- **Comprehensive Meta Tag Analysis**: Review all important SEO meta tags and their status
- **Visual Scorecards**: At-a-glance category summaries with color-coded progress indicators
- **Actionable Recommendations**: Get specific tips to improve your website's SEO performance
- **Responsive Design**: Fully functional on desktop and mobile devices
- **User Authentication**: Secure login and registration system with session persistence
- **PDF Export**: Generate professional PDF reports from analysis results
- **Data Persistence**: Store and retrieve historical analyses from a PostgreSQL database

## 🚀 Technologies Used

- **Frontend**: React with TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with bcrypt for secure password hashing
- **Session Management**: express-session with connect-pg-simple for persistent sessions
- **Styling**: Tailwind CSS with ShadCN UI components
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing
- **HTTP Client**: Built-in fetch API with custom wrapper
- **PDF Generation**: jsPDF for client-side PDF report creation
- **HTML Parsing**: Cheerio for server-side HTML analysis

## 📋 SEO Analysis Categories

The analyzer evaluates websites across several critical SEO categories:

1. **Basic SEO**
   - Title tags
   - Meta descriptions
   - URL structure
   - Headings hierarchy

2. **Social Media**
   - Open Graph tags
   - Twitter Card metadata
   - Social images and descriptions

3. **Meta Tags**
   - Canonical links
   - Robots directives
   - Language and locale settings
   - Viewport configuration

## 🛠️ Setup and Installation

### Prerequisites

- Node.js 16+ and npm
- PostgreSQL database

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/seo-meta-tag-analyzer.git
   cd seo-meta-tag-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgres://username:password@localhost:5432/seo_analyzer
   SESSION_SECRET=your_session_secret_here
   ```

4. Initialize the database
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

### Authentication

To use the authentication system:

1. Register a new account from the Register page
2. Login with your credentials
3. Use the authenticated features like saving analyses
4. Logout from the dropdown menu in the header

## 🔍 How to Use

1. Enter a website URL in the analyzer input field (the tool automatically adds the http/https protocol if not included)
2. Review the comprehensive analysis results
   - Check the overall SEO score at the top
   - Browse through category-specific summaries with visual indicators
   - See how your site appears in Google search results
   - View your site's appearance when shared on social media
   - Read detailed recommendations for improving your SEO

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Built with [Replit](https://replit.com)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/guide/packages/lucide-react)

---

Made by Louis with ❤️ and Replit
