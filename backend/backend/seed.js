// seed.js - Complete Data Seeder
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

// Load environment variables
require("dotenv").config();

// Import models
const User = require("./models/User");
const Profile = require("./models/Profile");
const Role = require("./models/Role");
const Question = require("./models/Question");
const Interview = require("./models/Interview");

// Configuration
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/interview-platform";
const CANDIDATE_COUNT = 10;
const HR_COUNT = 2;

// Helper function to generate random date between range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random item from array
const randomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random phone number
const randomPhone = () => {
  const digits = Math.floor(Math.random() * 9000000000) + 1000000000;
  return digits.toString();
};

// Helper function to generate random email
const randomEmail = (firstName, lastName) => {
  const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "tech.co"];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 99)}@${randomItem(domains)}`;
};

// Tamil Nadu specific data
const firstNames = [
  // Male Tamil Names
  "Arun", "Karthik", "Dinesh", "Suresh", "Ramesh", "Ganesh", "Kumar", "Mani", "Selvam", "Murugan",
  "Saravanan", "Prakash", "Rajesh", "Sekar", "Bala", "Muthu", "Velu", "Kannan", "Rajan", "Pandi",
  "Chezhiyan", "Ilango", "Madhan", "Parthiban", "Vikraman", "Anand", "Bharath", "Chandran", "Devan", "Ezhil",
  "Gunaseelan", "Hari", "Indiran", "Jegan", "Kabilan", "Loganathan", "Maran", "Nagarajan", "Oviyan", "Perumal",
  // Female Tamil Names
  "Priya", "Divya", "Lakshmi", "Meena", "Geetha", "Vasanthi", "Kavitha", "Deepa", "Radha", "Seetha",
  "Mala", "Sumathi", "Rani", "Selvi", "Kalyani", "Anjali", "Bhavani", "Chitra", "Devaki", "Eshwari",
  "Gomathi", "Hemalatha", "Indira", "Janani", "Kamala", "Lalitha", "Mangai", "Nandhini", "Oviya", "Pavithra",
  "Rajalakshmi", "Saraswathi", "Thilagavathi", "Uma", "Valli", "Yamuna", "Shakthi", "Vidhya", "Soundarya", "Vanitha"
];

const lastNames = [
  // Tamil Last Names/Caste names (commonly used as surnames)
  "Pillai", "Mudaliar", "Gounder", "Thevar", "Yadav", "Naidu", "Reddy", "Chettiar", "Iyer", "Iyengar",
  "Kumar", "Selvan", "Rajan", "Pandian", "Chozhan", "Chezhiyan", "Varman", "Devan", "Sekar", "Babu",
  "Udayar", "Vanniyar", "Padayachi", "Kavundar", "Kannadhasan", "Manickam", "Asari", "Kalar", "Nadar", "Vellalar",
  "Achari", "Sathiyaseelan", "Muthuraja", "Servai", "Konar", "Idaiyar", "Paravar", "Mukkuvar", "Sambavar", "Irular"
];

const cities = [
  // Major Cities
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukkudi", "Kanyakumari",
  // Other Cities
  "Tiruppur", "Karur", "Namakkal", "Dindigul", "Karaikudi", "Nagercoil", "Cuddalore", "Kanchipuram", "Thanjavur", "Ramanathapuram",
  // Towns
  "Ooty", "Kodaikanal", "Yercaud", "Kumbakonam", "Mahabalipuram", "Rameswaram", "Kanniyakumari", "Velankanni", "Palani", "Srirangam",
  // District Headquarters
  "Ariyalur", "Chengalpattu", "Dharmapuri", "Kallakurichi", "Krishnagiri", "Mayiladuthurai", "Nagapattinam", "Perambalur", "Pudukkottai", "Ranipet",
  "Sivaganga", "Tenkasi", "Theni", "Tirupathur", "Tiruvallur", "Tiruvannamalai", "Virudhunagar", "Viluppuram", "Thiruvarur", "Vellore"
];

const jobTitles = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "DevOps Engineer",
  "Data Scientist", "UI/UX Designer", "Product Manager", "Project Manager",
  "Quality Assurance Engineer", "Software Engineer", "Cloud Architect", "System Administrator",
  "Database Administrator", "Network Engineer", "Security Analyst", "Mobile Developer",
  "React Developer", "Node.js Developer", "Python Developer", "Java Developer"
];

const companies = [
  // Tamil Nadu based companies
  "TCS Chennai", "Infosys Chennai", "Wipro Chennai", "HCL Chennai", "Cognizant Chennai", "Accenture Chennai",
  "Zoho Corporation", "Freshworks", "Chargebee", "Unacademy", "Paytm", "Flipkart", "Amazon Chennai",
  "Google Chennai", "Microsoft Chennai", "Oracle Chennai", "IBM India", "Dell Chennai", "Intel India",
  "Standard Chartered", "Bank of America", "Wells Fargo", "PayPal Chennai", "Adobe Systems",
  "Virtusa Consulting", "Caterpillar Inc", "Ford Motors", "Hyundai Motors", "Renault Nissan",
  "Ashok Leyland", "TVS Motors", "L&T Infotech", "Ramco Systems", "Mphasis Chennai",
  "Hexaware Technologies", "Polaris Consulting", "iGate Chennai", "Sutherland Global", "HCL Technologies"
];

const industries = [
  "Information Technology", "E-commerce", "Banking", "Consulting", "Healthcare",
  "Education", "Manufacturing", "Telecommunications", "Media", "Transportation",
  "Automobile", "Software Development", "IT Services", "Product Based", "Service Based",
  "Financial Services", "Insurance", "Retail", "Logistics", "Real Estate"
];

const departments = [
  "Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "HR", "Finance",
  "Research & Development", "Quality Assurance", "Infrastructure", "Security", "Data Science",
  "Customer Support", "Business Development", "Administration", "Legal", "Procurement"
];

const skillNames = [
  // Technical Skills
  "JavaScript", "Python", "Java", "C++", "React", "Node.js", "Angular", "Vue.js",
  "MongoDB", "MySQL", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure",
  "Git", "Jenkins", "Terraform", "Ansible", "Machine Learning", "Data Analysis",
  "UI Design", "UX Research", "Figma", "Adobe XD", "Project Management", "Agile",
  "Scrum", "JIRA", "Communication", "Leadership", "Problem Solving", "Teamwork",
  // Tamil Specific (Languages)
  "Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada",
  // Additional Skills
  "Microsoft Office", "Excel", "PowerPoint", "Word", "Google Workspace",
  "Photoshop", "Illustrator", "Video Editing", "Content Writing", "Digital Marketing"
];

const universities = [
  // Tamil Nadu Universities
  "Anna University - Guindy", "Anna University - MIT Campus", "Anna University - ACT Campus",
  "University of Madras", "Madras Christian College", "Loyola College", "Presidency College",
  "IIT Madras", "NIT Tiruchirappalli", "IIIT Tiruchirappalli", "IIM Tiruchirappalli",
  "VIT University - Vellore", "VIT University - Chennai", "SRM University - Kattankulathur",
  "SRM University - Ramapuram", "SRM University - Vadapalani", "Sathyabama University",
  "Bharath University", "Saveetha University", "Chettinad University",
  "Bharathiar University - Coimbatore", "Bharathidasan University - Tiruchirappalli",
  "Madurai Kamaraj University", "Manonmaniam Sundaranar University", "Periyar University",
  "Alagappa University - Karaikudi", "Tamil University - Thanjavur", "Annamalai University",
  // Engineering Colleges
  "PSG College of Technology - Coimbatore", "Coimbatore Institute of Technology", 
  "Government College of Technology - Coimbatore", "Thiagarajar College of Engineering - Madurai",
  "Kumaraguru College of Technology - Coimbatore", "Kongu Engineering College - Perundurai",
  "Mepco Schlenk Engineering College - Sivakasi", "National Engineering College - Kovilpatti",
  "Velammal Engineering College - Chennai", "SSN Engineering College - Kalavakkam",
  "Rajalakshmi Engineering College - Chennai", "Panimalar Engineering College - Chennai",
  "Jerusalem College of Engineering - Chennai", "Sri Sairam Engineering College - Chennai",
  "Easwari Engineering College - Chennai", "St. Joseph's College of Engineering - Chennai",
  "Jeppiaar Engineering College - Chennai", "Saveetha Engineering College - Chennai",
  "Tagore Engineering College - Chennai", "Meenakshi College of Engineering - Chennai",
  // Arts & Science Colleges
  "Stella Maris College - Chennai", "Women's Christian College - Chennai",
  "Ethiraj College - Chennai", "MOP Vaishnav College - Chennai",
  "DG Vaishnav College - Chennai", "Ramakrishna Mission College - Coimbatore",
  "Nallamuthu Gounder College - Pollachi", "Chikkanna Government Arts College - Tiruppur",
  "Government Arts College - Coimbatore", "Government Arts College - Ooty"
];

const degrees = [
  // Engineering
  "B.E. Computer Science and Engineering", "B.Tech Information Technology", 
  "B.E. Electronics and Communication", "B.E. Electrical and Electronics",
  "B.E. Mechanical Engineering", "B.E. Civil Engineering", "B.Tech Artificial Intelligence",
  "B.Tech Data Science", "B.E. Biomedical Engineering", "B.E. Aerospace Engineering",
  // Technology
  "MCA - Master of Computer Applications", "M.Sc Computer Science", 
  "M.Sc Information Technology", "M.Tech Computer Science", "M.Tech Data Science",
  "M.E. Computer Science", "M.E. VLSI Design", "M.E. Embedded Systems",
  // Science
  "B.Sc Computer Science", "B.Sc Information Technology", "B.Sc Mathematics",
  "B.Sc Physics", "B.Sc Chemistry", "B.Sc Electronics", "B.Sc Statistics",
  // Commerce & Management
  "B.Com General", "B.Com Computer Applications", "B.Com Corporate Secretaryship",
  "BBA - Bachelor of Business Administration", "BCA - Bachelor of Computer Applications",
  "MBA - Master of Business Administration", "MBA - Systems Management",
  // Diploma
  "Diploma in Computer Engineering", "Diploma in Electrical Engineering",
  "Diploma in Mechanical Engineering", "Diploma in Civil Engineering",
  "Diploma in Electronics Engineering", "Diploma in Information Technology"
];

// Roles to create
const roleData = [
  { name: "Frontend Developer", description: "Develops user interfaces and client-side logic" },
  { name: "Backend Developer", description: "Builds server-side logic and APIs" },
  { name: "Full Stack Developer", description: "Works on both frontend and backend" },
  { name: "DevOps Engineer", description: "Manages infrastructure and deployment" },
  { name: "Data Scientist", description: "Analyzes data and builds ML models" },
  { name: "UI/UX Designer", description: "Designs user interfaces and experiences" },
  { name: "QA Engineer", description: "Tests software quality and automation" },
  { name: "Project Manager", description: "Manages project delivery and teams" }
];

// Question templates for different roles - 20-30 questions each
const questionTemplates = [
  // Frontend Developer Questions - 25 questions
  {
    role: "Frontend Developer",
    questions: [
      // Short Answer Questions
      {
        title: "What is the difference between '==' and '===' in JavaScript?",
        description: "Equality comparison operators in JavaScript",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "'==' performs type coercion while '===' checks both value and type"
      },
      {
        title: "Explain the concept of closures in JavaScript",
        description: "Advanced JavaScript concept",
        type: "Short-Answer",
        points: 10,
        timeLimit: 5,
        correctAnswer: "A closure is a function that has access to its outer function scope even after the outer function has returned"
      },
      {
        title: "What is the virtual DOM in React?",
        description: "React core concept",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "A lightweight copy of the actual DOM that React uses for efficient updates"
      },
      {
        title: "Explain the box model in CSS",
        description: "CSS fundamentals",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "The CSS box model consists of content, padding, border, and margin areas"
      },
      {
        title: "What is event delegation in JavaScript?",
        description: "DOM event handling",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "A technique where a single event listener on a parent element handles events for multiple child elements"
      },
      {
        title: "Explain the difference between localStorage and sessionStorage",
        description: "Web storage API",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "localStorage persists until manually cleared, sessionStorage clears when the browser tab is closed"
      },
      {
        title: "What are React hooks?",
        description: "React features",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Functions that allow functional components to use state and lifecycle features"
      },
      {
        title: "Explain CSS specificity",
        description: "CSS selectors",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "The algorithm browsers use to determine which CSS rule applies when conflicts occur"
      },
      {
        title: "What is the purpose of the 'key' prop in React lists?",
        description: "React rendering",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "Helps React identify which items have changed, been added, or been removed for efficient updates"
      },
      {
        title: "Explain the concept of hoisting in JavaScript",
        description: "JavaScript fundamentals",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "JavaScript's behavior of moving declarations to the top of their scope during compilation"
      },
      {
        title: "What is responsive web design?",
        description: "Web design principles",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "An approach to web design that makes web pages render well on different devices and screen sizes"
      },
      {
        title: "Explain the concept of prop drilling in React",
        description: "React state management",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Passing data through multiple nested components to reach a deeply nested child component"
      },
      {
        title: "What are CSS preprocessors?",
        description: "CSS tools",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "Tools like SASS/SCSS and LESS that extend CSS with variables, nesting, and functions"
      },
      // MCQ Questions
      {
        title: "Which CSS property is used to create a flex container?",
        description: "CSS Flexbox basics",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "display: flex", isCorrect: true },
          { id: 2, text: "position: flex", isCorrect: false },
          { id: 3, text: "container: flex", isCorrect: false },
          { id: 4, text: "flex-container: true", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which hook is used for side effects in React?",
        description: "React Hooks",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "useEffect", isCorrect: true },
          { id: 2, text: "useState", isCorrect: false },
          { id: 3, text: "useContext", isCorrect: false },
          { id: 4, text: "useReducer", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What does API stand for?",
        description: "Basic terminology",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Application Programming Interface", isCorrect: true },
          { id: 2, text: "Advanced Programming Integration", isCorrect: false },
          { id: 3, text: "Application Process Integration", isCorrect: false },
          { id: 4, text: "Automated Program Interface", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which HTML tag is used to include JavaScript?",
        description: "HTML basics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "<script>", isCorrect: true },
          { id: 2, text: "<javascript>", isCorrect: false },
          { id: 3, text: "<js>", isCorrect: false },
          { id: 4, text: "<code>", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the correct way to declare a variable in JavaScript?",
        description: "JavaScript basics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "let x = 5;", isCorrect: true },
          { id: 2, text: "variable x = 5;", isCorrect: false },
          { id: 3, text: "x = 5;", isCorrect: false },
          { id: 4, text: "int x = 5;", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which CSS property changes the text color?",
        description: "CSS basics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "color", isCorrect: true },
          { id: 2, text: "text-color", isCorrect: false },
          { id: 3, text: "font-color", isCorrect: false },
          { id: 4, text: "background-color", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the output of typeof null in JavaScript?",
        description: "JavaScript quirks",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "object", isCorrect: true },
          { id: 2, text: "null", isCorrect: false },
          { id: 3, text: "undefined", isCorrect: false },
          { id: 4, text: "boolean", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which method is used to add elements at the end of an array?",
        description: "Array methods",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "push()", isCorrect: true },
          { id: 2, text: "pop()", isCorrect: false },
          { id: 3, text: "shift()", isCorrect: false },
          { id: 4, text: "unshift()", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the correct HTML for referring to an external CSS?",
        description: "HTML/CSS integration",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "<link rel='stylesheet' href='styles.css'>", isCorrect: true },
          { id: 2, text: "<style src='styles.css'>", isCorrect: false },
          { id: 3, text: "<css src='styles.css'>", isCorrect: false },
          { id: 4, text: "<stylesheet>styles.css</stylesheet>", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which operator is used for strict equality comparison?",
        description: "JavaScript operators",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "===", isCorrect: true },
          { id: 2, text: "==", isCorrect: false },
          { id: 3, text: "=", isCorrect: false },
          { id: 4, text: "!==", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What does the 'map' method return in JavaScript?",
        description: "Array methods",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "A new array", isCorrect: true },
          { id: 2, text: "The original array", isCorrect: false },
          { id: 3, text: "A boolean", isCorrect: false },
          { id: 4, text: "A string", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which CSS property controls the spacing between elements?",
        description: "CSS layout",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "margin", isCorrect: true },
          { id: 2, text: "padding", isCorrect: false },
          { id: 3, text: "spacing", isCorrect: false },
          { id: 4, text: "border-spacing", isCorrect: false }
        ],
        optionType: "single"
      }
    ]
  },
  // Backend Developer Questions - 23 questions
  {
    role: "Backend Developer",
    questions: [
      // Short Answer Questions
      {
        title: "Explain RESTful API principles",
        description: "API design concepts",
        type: "Short-Answer",
        points: 10,
        timeLimit: 5,
        correctAnswer: "RESTful APIs use HTTP methods, are stateless, and use resource-based URLs with standard status codes"
      },
      {
        title: "What is indexing in databases?",
        description: "Database optimization",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "A data structure that improves the speed of data retrieval operations on a database table"
      },
      {
        title: "Explain the concept of middleware in web applications",
        description: "Web development",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "Software that sits between the request and response cycle, processing requests before they reach route handlers"
      },
      {
        title: "What is ACID in database transactions?",
        description: "Database concepts",
        type: "Short-Answer",
        points: 9,
        timeLimit: 5,
        correctAnswer: "Atomicity, Consistency, Isolation, Durability - properties that ensure reliable database transactions"
      },
      {
        title: "Explain the difference between authentication and authorization",
        description: "Security concepts",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "Authentication verifies identity, authorization determines what authenticated users can access"
      },
      {
        title: "What is JWT and how does it work?",
        description: "Authentication",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "JSON Web Token - a compact, URL-safe token format for securely transmitting information between parties"
      },
      {
        title: "Explain the concept of load balancing",
        description: "System design",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "Distributing network traffic across multiple servers to ensure no single server becomes overwhelmed"
      },
      {
        title: "What is caching and why is it important?",
        description: "Performance optimization",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "Storing frequently accessed data in fast-access storage to reduce latency and server load"
      },
      {
        title: "Explain the CAP theorem",
        description: "Distributed systems",
        type: "Short-Answer",
        points: 10,
        timeLimit: 5,
        correctAnswer: "A distributed system can only guarantee two of three: Consistency, Availability, and Partition tolerance"
      },
      {
        title: "What is SQL injection and how to prevent it?",
        description: "Security",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "An attack where malicious SQL code is inserted into queries; prevented by parameterized queries and input validation"
      },
      {
        title: "Explain the difference between SQL and NoSQL databases",
        description: "Database types",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "SQL databases are relational with fixed schemas; NoSQL are non-relational with flexible schemas and horizontal scaling"
      },
      // MCQ Questions
      {
        title: "Which HTTP method is used to update an existing resource?",
        description: "HTTP methods",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "PUT/PATCH", isCorrect: true },
          { id: 2, text: "GET", isCorrect: false },
          { id: 3, text: "POST", isCorrect: false },
          { id: 4, text: "DELETE", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the primary function of an ORM?",
        description: "Database tools",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Map objects to database tables", isCorrect: true },
          { id: 2, text: "Create database backups", isCorrect: false },
          { id: 3, text: "Generate UI components", isCorrect: false },
          { id: 4, text: "Handle user authentication", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which status code indicates a successful HTTP request?",
        description: "HTTP status codes",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "200 OK", isCorrect: true },
          { id: 2, text: "404 Not Found", isCorrect: false },
          { id: 3, text: "500 Internal Server Error", isCorrect: false },
          { id: 4, text: "301 Moved Permanently", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the default port for MongoDB?",
        description: "Database ports",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "27017", isCorrect: true },
          { id: 2, text: "3306", isCorrect: false },
          { id: 3, text: "5432", isCorrect: false },
          { id: 4, text: "6379", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which of the following is a NoSQL database?",
        description: "Database types",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "MongoDB", isCorrect: true },
          { id: 2, text: "MySQL", isCorrect: false },
          { id: 3, text: "PostgreSQL", isCorrect: false },
          { id: 4, text: "Oracle", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What does the 'npm' command stand for?",
        description: "Node.js tools",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Node Package Manager", isCorrect: true },
          { id: 2, text: "New Programming Module", isCorrect: false },
          { id: 3, text: "Node Process Manager", isCorrect: false },
          { id: 4, text: "Native Package Module", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which SQL clause is used to filter records?",
        description: "SQL basics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "WHERE", isCorrect: true },
          { id: 2, text: "HAVING", isCorrect: false },
          { id: 3, text: "FILTER", isCorrect: false },
          { id: 4, text: "GROUP BY", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the purpose of a foreign key in a database?",
        description: "Database relationships",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Link tables together", isCorrect: true },
          { id: 2, text: "Create indexes", isCorrect: false },
          { id: 3, text: "Store passwords", isCorrect: false },
          { id: 4, text: "Optimize queries", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which HTTP method is idempotent?",
        description: "HTTP methods",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "PUT", isCorrect: true },
          { id: 2, text: "POST", isCorrect: false },
          { id: 3, text: "PATCH", isCorrect: false },
          { id: 4, text: "All of the above", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the time complexity of binary search?",
        description: "Algorithms",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "O(log n)", isCorrect: true },
          { id: 2, text: "O(n)", isCorrect: false },
          { id: 3, text: "O(n log n)", isCorrect: false },
          { id: 4, text: "O(n²)", isCorrect: false }
        ],
        optionType: "single"
      }
    ]
  },
  // DevOps Engineer Questions - 22 questions
  {
    role: "DevOps Engineer",
    questions: [
      // Short Answer Questions
      {
        title: "What is CI/CD?",
        description: "DevOps practices",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Continuous Integration and Continuous Deployment/Delivery - automating build, test, and deployment processes"
      },
      {
        title: "Explain the difference between Docker and Virtual Machines",
        description: "Containerization",
        type: "Short-Answer",
        points: 10,
        timeLimit: 5,
        correctAnswer: "Docker containers share host OS kernel while VMs have full OS, making containers lighter and faster"
      },
      {
        title: "What is Kubernetes and why is it used?",
        description: "Container orchestration",
        type: "Short-Answer",
        points: 10,
        timeLimit: 5,
        correctAnswer: "An open-source platform for automating deployment, scaling, and management of containerized applications"
      },
      {
        title: "Explain Infrastructure as Code (IaC)",
        description: "DevOps concepts",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Managing and provisioning infrastructure through machine-readable definition files, not physical hardware configuration"
      },
      {
        title: "What is a reverse proxy?",
        description: "Networking",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "A server that forwards client requests to other servers and returns responses to clients"
      },
      {
        title: "Explain the concept of blue-green deployment",
        description: "Deployment strategies",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "A deployment strategy with two environments, reducing downtime and risk by switching traffic between versions"
      },
      {
        title: "What is a container registry?",
        description: "Container management",
        type: "Short-Answer",
        points: 5,
        timeLimit: 3,
        correctAnswer: "A repository for storing and distributing container images"
      },
      {
        title: "Explain the purpose of a load balancer",
        description: "Infrastructure",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "Distributes incoming network traffic across multiple servers to ensure availability and reliability"
      },
      {
        title: "What is configuration drift and how to prevent it?",
        description: "Configuration management",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "When servers in an infrastructure become different over time; prevented by IaC and configuration management tools"
      },
      {
        title: "Explain the concept of chaos engineering",
        description: "Testing",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Testing system resilience by intentionally introducing failures to identify weaknesses"
      },
      {
        title: "What is a Pod in Kubernetes?",
        description: "Kubernetes basics",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "The smallest deployable unit in Kubernetes that can contain one or more containers"
      },
      // MCQ Questions
      {
        title: "Which tool is used for configuration management?",
        description: "DevOps tools",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Ansible", isCorrect: true },
          { id: 2, text: "Docker", isCorrect: false },
          { id: 3, text: "Kubernetes", isCorrect: false },
          { id: 4, text: "Git", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What does the 'docker-compose' command do?",
        description: "Docker tools",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Define and run multi-container applications", isCorrect: true },
          { id: 2, text: "Build Docker images", isCorrect: false },
          { id: 3, text: "Push images to registry", isCorrect: false },
          { id: 4, text: "Monitor containers", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which cloud provider offers EC2 instances?",
        description: "Cloud computing",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "AWS", isCorrect: true },
          { id: 2, text: "Azure", isCorrect: false },
          { id: 3, text: "Google Cloud", isCorrect: false },
          { id: 4, text: "DigitalOcean", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the default port for Jenkins?",
        description: "CI/CD tools",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "8080", isCorrect: true },
          { id: 2, text: "80", isCorrect: false },
          { id: 3, text: "443", isCorrect: false },
          { id: 4, text: "3000", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which tool is used for monitoring containers?",
        description: "Monitoring tools",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Prometheus", isCorrect: true },
          { id: 2, text: "Jenkins", isCorrect: false },
          { id: 3, text: "GitLab", isCorrect: false },
          { id: 4, text: "Maven", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the purpose of a Dockerfile?",
        description: "Docker basics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Define how to build a Docker image", isCorrect: true },
          { id: 2, text: "Run Docker containers", isCorrect: false },
          { id: 3, text: "Configure Docker networks", isCorrect: false },
          { id: 4, text: "Manage Docker volumes", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which Kubernetes object manages replica sets?",
        description: "Kubernetes concepts",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Deployment", isCorrect: true },
          { id: 2, text: "Service", isCorrect: false },
          { id: 3, text: "ConfigMap", isCorrect: false },
          { id: 4, text: "Secret", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is 'git' primarily used for?",
        description: "Version control",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Version control", isCorrect: true },
          { id: 2, text: "Containerization", isCorrect: false },
          { id: 3, text: "Deployment", isCorrect: false },
          { id: 4, text: "Monitoring", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which protocol does SSH use?",
        description: "Networking",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Port 22", isCorrect: true },
          { id: 2, text: "Port 80", isCorrect: false },
          { id: 3, text: "Port 443", isCorrect: false },
          { id: 4, text: "Port 21", isCorrect: false }
        ],
        optionType: "single"
      }
    ]
  },
  // Data Scientist Questions - 24 questions
  {
    role: "Data Scientist",
    questions: [
      // Short Answer Questions
      {
        title: "Explain the difference between supervised and unsupervised learning",
        description: "Machine Learning basics",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Supervised learning uses labeled data for training, unsupervised learning finds patterns in unlabeled data"
      },
      {
        title: "What is overfitting in machine learning?",
        description: "ML concepts",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "When a model learns training data too well, including noise, performing poorly on new data"
      },
      {
        title: "Explain the concept of p-value in statistics",
        description: "Statistics",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Probability of obtaining results at least as extreme as observed, assuming null hypothesis is true"
      },
      {
        title: "What is feature engineering?",
        description: "Data preparation",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "Process of creating new features or transforming existing ones to improve model performance"
      },
      {
        title: "Explain the bias-variance tradeoff",
        description: "ML concepts",
        type: "Short-Answer",
        points: 9,
        timeLimit: 5,
        correctAnswer: "Balance between model's error from wrong assumptions (bias) and sensitivity to training data (variance)"
      },
      {
        title: "What is a confusion matrix?",
        description: "Model evaluation",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "A table showing true positives, false positives, true negatives, and false negatives for classification"
      },
      {
        title: "Explain the concept of gradient descent",
        description: "Optimization",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "An optimization algorithm that iteratively moves towards the minimum of a function"
      },
      {
        title: "What is cross-validation?",
        description: "Model validation",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "Technique to assess model performance by splitting data into training and validation sets multiple times"
      },
      {
        title: "Explain the difference between correlation and causation",
        description: "Statistics",
        type: "Short-Answer",
        points: 6,
        timeLimit: 3,
        correctAnswer: "Correlation measures relationship, causation indicates one variable directly affects another"
      },
      {
        title: "What is a neural network?",
        description: "Deep Learning",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "Computing system inspired by biological neural networks, consisting of interconnected nodes/neurons"
      },
      {
        title: "Explain the concept of regularization",
        description: "ML techniques",
        type: "Short-Answer",
        points: 7,
        timeLimit: 4,
        correctAnswer: "Technique to prevent overfitting by adding penalty terms to the loss function"
      },
      {
        title: "What is principal component analysis (PCA)?",
        description: "Dimensionality reduction",
        type: "Short-Answer",
        points: 8,
        timeLimit: 4,
        correctAnswer: "Technique to reduce dimensionality by transforming variables into principal components"
      },
      // MCQ Questions
      {
        title: "Which of the following is a supervised learning algorithm?",
        description: "ML algorithms",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Linear Regression", isCorrect: true },
          { id: 2, text: "K-means Clustering", isCorrect: false },
          { id: 3, text: "Apriori Algorithm", isCorrect: false },
          { id: 4, text: "PCA", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What does the 'K' represent in K-Nearest Neighbors?",
        description: "ML algorithms",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Number of neighbors to consider", isCorrect: true },
          { id: 2, text: "Number of clusters", isCorrect: false },
          { id: 3, text: "Number of features", isCorrect: false },
          { id: 4, text: "Number of iterations", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which Python library is primarily used for data manipulation?",
        description: "Data science tools",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Pandas", isCorrect: true },
          { id: 2, text: "NumPy", isCorrect: false },
          { id: 3, text: "Scikit-learn", isCorrect: false },
          { id: 4, text: "Matplotlib", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the purpose of a test dataset?",
        description: "Model evaluation",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Evaluate final model performance", isCorrect: true },
          { id: 2, text: "Train the model", isCorrect: false },
          { id: 3, text: "Tune hyperparameters", isCorrect: false },
          { id: 4, text: "Feature selection", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which metric is used for classification problems?",
        description: "Model metrics",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Accuracy", isCorrect: true },
          { id: 2, text: "Mean Squared Error", isCorrect: false },
          { id: 3, text: "R-squared", isCorrect: false },
          { id: 4, text: "Mean Absolute Error", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "What is the output of a logistic regression model?",
        description: "ML algorithms",
        type: "MCQ",
        points: 3,
        timeLimit: 2,
        options: [
          { id: 1, text: "Probability between 0 and 1", isCorrect: true },
          { id: 2, text: "Continuous value", isCorrect: false },
          { id: 3, text: "Categories only", isCorrect: false },
          { id: 4, text: "Binary output only", isCorrect: false }
        ],
        optionType: "single"
      },
      {
        title: "Which technique is used to handle missing data?",
        description: "Data preprocessing",
        type: "MCQ",
        points: 2,
        timeLimit: 1,
        options: [
          { id: 1, text: "Imputation", isCorrect: true },
          { id: 2, text: "Normalization", isCorrect: false },
          { id: 3, text: "Standardization", isCorrect: false },
          { id: 4, text: "One-hot encoding", isCorrect: false }
        ],
        optionType: "single"
      }
    ]
  }
];

// Interview templates
const interviewTemplates = [
  {
    title: "Frontend Developer Interview - {month}",
    jobTitle: "Frontend Developer",
    department: "Engineering",
    rounds: ["intro", "mcq", "coding"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 20, enabled: true, questionCount: 10 },
      coding: { duration: 45, enabled: true, language: "javascript", difficulty: "medium" }
    }
  },
  {
    title: "Backend Developer Technical Round - {month}",
    jobTitle: "Backend Developer",
    department: "Engineering",
    rounds: ["intro", "mcq", "coding"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 25, enabled: true, questionCount: 12 },
      coding: { duration: 50, enabled: true, language: "python", difficulty: "hard" }
    }
  },
  {
    title: "DevOps Engineer Assessment - {month}",
    jobTitle: "DevOps Engineer",
    department: "Infrastructure",
    rounds: ["intro", "mcq"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 30, enabled: true, questionCount: 15 },
      coding: { duration: 0, enabled: false }
    }
  },
  {
    title: "Full Stack Developer Interview - {month}",
    jobTitle: "Full Stack Developer",
    department: "Engineering",
    rounds: ["intro", "mcq", "coding"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 25, enabled: true, questionCount: 12 },
      coding: { duration: 60, enabled: true, language: "javascript", difficulty: "hard" }
    }
  },
  {
    title: "Data Scientist Interview - {month}",
    jobTitle: "Data Scientist",
    department: "Data Science",
    rounds: ["intro", "mcq", "coding"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 30, enabled: true, questionCount: 15 },
      coding: { duration: 45, enabled: true, language: "python", difficulty: "hard" }
    }
  },
  {
    title: "UI/UX Designer Interview - {month}",
    jobTitle: "UI/UX Designer",
    department: "Design",
    rounds: ["intro", "mcq"],
    roundSettings: {
      intro: { duration: 5, enabled: true },
      mcq: { duration: 20, enabled: true, questionCount: 10 },
      coding: { duration: 0, enabled: false }
    }

    
  }
];

// Function to generate candidate profiles
const generateCandidates = async (hrUsers) => {
  console.log("\n📋 Generating candidate profiles...");
  
  const candidates = [];
  const usedEmails = new Set();

  for (let i = 0; i < CANDIDATE_COUNT; i++) {
    try {
      // Generate basic info
      const firstName = randomItem(firstNames);
      const lastName = randomItem(lastNames);
      let email = randomEmail(firstName, lastName);
      
      // Ensure unique email
      while (usedEmails.has(email)) {
        email = randomEmail(firstName, lastName) + randomBetween(1, 999);
      }
      usedEmails.add(email);

      const phone = randomPhone();
      const password = "candidate123"; // Default password for all candidates
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "candidate",
        isActive: true,
        phone,
        createdBy: randomItem(hrUsers)._id
      });

      // Generate experience
      const expYears = randomBetween(0, 12);
      const expString = expYears === 0 ? "Fresher" : `${expYears} years`;

      // Generate random skills (3-7 skills)
      const numSkills = randomBetween(3, 7);
      const shuffledSkills = [...skillNames].sort(() => 0.5 - Math.random());
      const skills = shuffledSkills.slice(0, numSkills).map(name => ({
        name,
        level: randomItem(["Beginner", "Intermediate", "Advanced", "Expert"]),
        years: randomBetween(1, Math.max(1, expYears))
      }));

      // Generate education (1-2 entries)
      const numEducation = randomBetween(1, 2);
      const education = [];
      for (let j = 0; j < numEducation; j++) {
        education.push({
          degree: randomItem(degrees),
          field: randomItem(["Computer Science", "Information Technology", "Electronics", "Data Science", "Mathematics"]),
          institution: randomItem(universities),
          year: (2020 - j * 2).toString(),
          grade: randomItem(["A", "B+", "A-", "First Class", "Distinction", "8.5 CGPA", "9.0 CGPA"]),
          description: `Graduated with focus on ${randomItem(["algorithms", "web development", "data structures", "software engineering", "machine learning", "cloud computing"])}`
        });
      }

      // Generate address with Tamil Nadu cities
      const city = randomItem(cities);
      const address = `${randomBetween(1, 999)} ${randomItem(["Main Road", "Gandhi Street", "Nehru Street", "South Street", "North Street", "East Street", "West Street", "Temple Street", "Bazaar Street", "Hospital Road"])}, ${city}, Tamil Nadu - ${randomBetween(600001, 643250)}`;

      // Create profile
      const profile = await Profile.create({
        user: user._id,
        personal: {
          firstName,
          lastName,
          email,
          phone,
          address: address,
          gender: randomItem(["Male", "Female", "Other"]),
          dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2000, 0, 1)),
          profilePhoto: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff&size=256`
        },
        professional: {
          title: randomItem(jobTitles),
          experience: expString,
          experienceLevel: expYears < 2 ? "Entry" : expYears < 5 ? "Intermediate" : expYears < 8 ? "Senior" : "Lead",
          currentCompany: expYears > 0 ? randomItem(companies) : "Fresher",
          currentSalary: expYears > 0 ? `${randomBetween(3, 25)} LPA` : "NA",
          department: randomItem(departments),
          employmentType: randomItem(["Full Time", "Contract", "Internship"]),
          expectedSalary: `${randomBetween(5, 35)} LPA`,
          industry: randomItem(industries),
          noticePeriod: randomItem(["Immediate", "15 Days", "30 Days", "45 Days", "60 Days"]),
          availability: randomItem(["Immediate", "Within 15 days", "Within 30 days"]),
          candidateId: `CAND${String(i + 1).padStart(3, '0')}${Date.now().toString().slice(-4)}`,
          status: randomItem(["Active", "Active", "Active", "Interviewing", "Shortlisted"]),
          memberSince: randomDate(new Date(2023, 0, 1), new Date())
        },
        education,
        skills
      });

      candidates.push({ user, profile });
      console.log(`  ✅ Candidate ${i + 1}: ${firstName} ${lastName} (${email}) - ${city}`);

    } catch (error) {
      console.log(`  ❌ Error creating candidate ${i + 1}:`, error.message);
    }
  }

  console.log(`✅ Generated ${candidates.length} candidates from Tamil Nadu`);
  return candidates;
};

// Function to generate HR users
const generateHRs = async (adminUser) => {
  console.log("\n👤 Generating HR accounts...");
  
  const hrData = [
    {
      firstName: "Rajesh",
      lastName: "Kumar",
      email: "rajesh.kumar@company.com",
      phone: "9876543210",
      password: "hr123456",
      city: "Chennai"
    },
    {
      firstName: "Priya",
      lastName: "Rajan",
      email: "priya.rajan@company.com",
      phone: "9876543211",
      password: "hr123456",
      city: "Coimbatore"
    }
  ];

  const hrUsers = [];

  for (let i = 0; i < hrData.length; i++) {
    try {
      const data = hrData[i];
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await User.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: "hr",
        isActive: true,
        phone: data.phone,
        createdBy: adminUser._id
      });

      await Profile.create({
        user: user._id,
        personal: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          address: `${data.city}, Tamil Nadu`
        },
        professional: {
          title: "HR Manager",
          department: "Human Resources",
          employeeId: `HR${String(i + 1).padStart(3, '0')}`,
          status: "Active",
          memberSince: new Date()
        }
      });

      hrUsers.push(user);
      console.log(`  ✅ HR ${i + 1}: ${data.firstName} ${data.lastName} (${data.email}) - ${data.city}`);

    } catch (error) {
      console.log(`  ❌ Error creating HR ${i + 1}:`, error.message);
    }
  }

  return hrUsers;
};

// Function to generate roles
const generateRoles = async (adminUser, hrUsers) => {
  console.log("\n🎯 Generating roles...");
  
  const roles = [];
  
  for (const role of roleData) {
    try {
      const newRole = await Role.create({
        name: role.name,
        description: role.description,
        isActive: true,
        createdBy: randomItem([adminUser._id, ...hrUsers.map(h => h._id)])
      });
      roles.push(newRole);
      console.log(`  ✅ Role: ${role.name}`);
    } catch (error) {
      console.log(`  ❌ Error creating role ${role.name}:`, error.message);
    }
  }

  return roles;
};

// Function to generate questions
const generateQuestions = async (roles, hrUsers) => {
  console.log("\n❓ Generating questions...");
  
  const questions = [];
  
  for (const template of questionTemplates) {
    const role = roles.find(r => r.name === template.role);
    if (!role) continue;

    for (const questionData of template.questions) {
      try {
        const question = await Question.create({
          title: questionData.title,
          description: questionData.description,
          type: questionData.type,
          points: questionData.points,
          timeLimit: questionData.timeLimit,
          isActive: true,
          roles: [role._id],
          correctAnswer: questionData.correctAnswer,
          options: questionData.options || [],
          optionType: questionData.optionType || "single",
          createdBy: randomItem(hrUsers)._id
        });
        questions.push(question);
        console.log(`  ✅ Question: ${questionData.title.substring(0, 40)}...`);
      } catch (error) {
        console.log(`  ❌ Error creating question: ${questionData.title}`, error.message);
      }
    }
  }

  return questions;
};

// Function to generate interviews
const generateInterviews = async (candidates, hrUsers, roles) => {
  console.log("\n📅 Generating interviews...");
  
  const interviews = [];
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  const currentMonth = months[today.getMonth()];

  // Create 5-8 interviews
  const numInterviews = randomBetween(5, 8);

  for (let i = 0; i < numInterviews; i++) {
    try {
      const template = randomItem(interviewTemplates);
      const hr = randomItem(hrUsers);
      const interviewDate = randomDate(today, nextMonth);
      
      // Select 3-6 random candidates for this interview
      const numCandidates = randomBetween(3, 6);
      const shuffledCandidates = [...candidates].sort(() => 0.5 - Math.random());
      const selectedCandidates = shuffledCandidates.slice(0, numCandidates).map(c => {
        // Random status distribution
        const statusRand = Math.random();
        let status;
        if (statusRand < 0.3) status = "pending";
        else if (statusRand < 0.6) status = "confirmed";
        else if (statusRand < 0.8) status = "completed";
        else status = "cancelled";

        return {
          candidateId: c.profile._id,
          name: `${c.user.firstName} ${c.user.lastName}`,
          email: c.user.email,
          phone: c.user.phone,
          type: "candidate",
          status: status,
          invitationSent: true,
          invitationSentAt: randomDate(new Date(interviewDate.getTime() - 7 * 24 * 60 * 60 * 1000), interviewDate),
          responseAt: status !== "pending" ? randomDate(interviewDate, new Date(interviewDate.getTime() + 2 * 24 * 60 * 60 * 1000)) : undefined,
          feedback: status === "completed" ? {
            rating: randomBetween(3, 5),
            comments: randomItem(["Excellent candidate", "Good technical skills", "Great communication", "Needs improvement", "Well prepared", "Strong problem solving skills"]),
            submittedAt: new Date(interviewDate.getTime() + randomBetween(1, 3) * 24 * 60 * 60 * 1000)
          } : undefined,
          notes: randomItem(["", "Looking promising", "Schedule follow-up", "Good cultural fit", "Technical skills strong", "Consider for next round"])
        };
      });

      const startHour = randomBetween(9, 17);
      const startMinute = randomBetween(0, 1) === 0 ? "00" : "30";
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute}`;

      const interview = await Interview.create({
        interviewTitle: template.title.replace("{month}", currentMonth) + ` ${i + 1}`,
        interviewType: randomItem(["individual", "batch"]),
        jobTitle: template.jobTitle,
        department: template.department,
        interviewDate,
        startTime,
        timezone: "IST",
        rounds: template.rounds,
        roundSettings: template.roundSettings,
        selectedCandidates,
        sendEmail: Math.random() > 0.3,
        sendSMS: Math.random() > 0.7,
        customMessage: "Vanakkam! Welcome to your interview at our Chennai office. Please be prepared and join 5 minutes early.",
        status: interviewDate > today ? "scheduled" : 
                interviewDate < today ? "completed" : 
                randomItem(["scheduled", "in-progress"]),
        createdBy: hr._id,
        createdByName: `${hr.firstName} ${hr.lastName}`
      });

      // Calculate total duration
      interview.totalDuration = template.rounds.reduce((total, round) => {
        return total + (template.roundSettings[round]?.duration || 0);
      }, 0);

      // Generate interview links
      interview.generateInterviewLinks();
      
      // Calculate results if completed
      if (interview.status === "completed") {
        interview.calculateResults();
      }

      await interview.save();
      
      interviews.push(interview);
      console.log(`  ✅ Interview ${i + 1}: ${interview.interviewTitle} (${interview.selectedCandidates.length} candidates)`);

    } catch (error) {
      console.log(`  ❌ Error creating interview ${i + 1}:`, error.message);
    }
  }

  return interviews;
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding with Tamil Nadu data...");
    console.log("=================================");

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Role.deleteMany({});
    await Question.deleteMany({});
    await Interview.deleteMany({});
    console.log("✅ Database cleared");

    // Create admin user
    console.log("\n👑 Creating admin user...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const adminUser = await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: "admin@interviewplatform.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
      phone: "9999999999"
    });
    console.log(`  ✅ Admin: Super Admin (admin@interviewplatform.com)`);

    // Create profile for admin
    await Profile.create({
      user: adminUser._id,
      personal: {
        firstName: "Super",
        lastName: "Admin",
        email: "admin@interviewplatform.com",
        phone: "9999999999",
        address: "Chennai, Tamil Nadu"
      },
      professional: {
        title: "System Administrator",
        employeeId: "ADMIN001",
        status: "Active",
        memberSince: new Date()
      }
    });

    // Generate HR users
    const hrUsers = await generateHRs(adminUser);

    // Generate roles
    const roles = await generateRoles(adminUser, hrUsers);

    // Generate candidates
    const candidates = await generateCandidates(hrUsers);

    // Generate questions
    const questions = await generateQuestions(roles, [...hrUsers, adminUser]);

    // Generate interviews
    const interviews = await generateInterviews(candidates, hrUsers, roles);

    // Calculate and display statistics
    console.log("\n📊 Seeding Summary - Tamil Nadu Edition");
    console.log("=================================");
    console.log(`✅ Admin Users: 1`);
    console.log(`✅ HR Users: ${hrUsers.length}`);
    console.log(`✅ Candidates: ${candidates.length}`);
    console.log(`✅ Roles: ${roles.length}`);
    console.log(`✅ Questions: ${questions.length}`);
    console.log(`✅ Interviews: ${interviews.length}`);

    // Calculate total candidates across interviews
    const totalCandidateSlots = interviews.reduce((sum, i) => sum + i.selectedCandidates.length, 0);
    console.log(`✅ Interview Slots: ${totalCandidateSlots}`);

    // Status distribution
    const interviewStatus = {
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => i.status === 'cancelled').length,
      'in-progress': interviews.filter(i => i.status === 'in-progress').length
    };
    console.log(`\n📈 Interview Status:`);
    console.log(`   - Scheduled: ${interviewStatus.scheduled}`);
    console.log(`   - In Progress: ${interviewStatus['in-progress']}`);
    console.log(`   - Completed: ${interviewStatus.completed}`);
    console.log(`   - Cancelled: ${interviewStatus.cancelled}`);

    console.log("\n🔑 Login Credentials");
    console.log("=================================");
    console.log("Admin:");
    console.log("  Email: admin@interviewplatform.com");
    console.log("  Password: admin123");
    console.log("\nHR Users:");
    hrUsers.forEach((hr, index) => {
      console.log(`  HR ${index + 1}: ${hr.email} / hr123456`);
    });
    console.log("\nCandidates:");
    console.log("  All candidates have password: candidate123");
    candidates.slice(0, 3).forEach((c, index) => {
      console.log(`  Candidate ${index + 1}: ${c.user.email} / candidate123`);
    });
    console.log(`  ... and ${candidates.length - 3} more candidates`);

    console.log("\n🌍 All data is from Tamil Nadu");
    console.log("=================================");
    console.log("✅ Database seeding completed successfully!");
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");

  } catch (error) {
    console.error("\n❌ Seeding error:", error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();