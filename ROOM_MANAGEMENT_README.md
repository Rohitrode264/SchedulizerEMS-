# 🏢 Room Management System

A comprehensive room management system for academic institutions with support for multiple academic blocks, advanced filtering, and efficient room allocation.

## ✨ Features

### 🏗️ Academic Block Management
- **Multiple Block Types**: Academic Block, G Block, Digital Block, IT Block, MBA Block
- **Block Configuration**: Name, code, description, location, and active status
- **Room Distribution**: Visual representation of rooms per block

### 🚪 Room Management
- **Room Types**: Classrooms, Laboratories, Seminar Halls, Auditoriums, Conference Rooms
- **Detailed Properties**: Name, code, floor, capacity, features, availability
- **Status Management**: Active/Inactive rooms with assignment protection

### 🔍 Advanced Filtering & Search
- **Block-based Filtering**: Filter rooms by specific academic blocks
- **Multi-criteria Search**: Capacity, floor, room type, department, status
- **Text Search**: Search by room name or code
- **Real-time Filtering**: Instant results with active filter display

### 📊 Analytics & Statistics
- **Overview Dashboard**: Total rooms, labs, classrooms, and blocks
- **Block Distribution**: Room count per academic block
- **Assignment Tracking**: Current room usage and availability

## 🏗️ System Architecture

### Database Schema
```prisma
model AcademicBlock {
  id          String   @id @default(uuid())
  name        String   // e.g., "Academic Block", "G Block"
  blockCode   String   @unique // e.g., "ACAD", "GBLK"
  description String?
  location    String?
  schoolId    String
  isActive    Boolean  @default(true)
  rooms       Room[]
}

model Room {
  id              String        @id @default(uuid())
  name            String        // e.g., "Computer Lab 1"
  code            String        @unique // e.g., "ACAD-101"
  floor           Int
  capacity        Int
  isLab           Boolean
  isActive        Boolean
  academicBlockId String
  departmentId    String?
  availability    Int[]         // Time slots (0-23)
  academicBlock   AcademicBlock @relation(fields: [academicBlockId], references: [id])
}
```

### API Endpoints

#### Academic Blocks
- `GET /api/v1/rooms/blocks` - Get all academic blocks
- `GET /api/v1/rooms/stats/overview` - Get room statistics

#### Rooms
- `GET /api/v1/rooms` - Get rooms with filters and pagination
- `GET /api/v1/rooms/:id` - Get room by ID
- `POST /api/v1/rooms` - Create new room
- `PUT /api/v1/rooms/:id` - Update room
- `DELETE /api/v1/rooms/:id` - Delete room
- `GET /api/v1/rooms/block/:blockId` - Get rooms by block

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- PostgreSQL database
- Prisma CLI

### Backend Setup
1. **Install Dependencies**
   ```bash
   cd SchedulizerEMS-/backend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file:
   ```env
   PORT=3000
   JWT_SECRET=your-secret-key-here
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Start Server**
   ```bash
   npm run dev
   ```

### Frontend Setup
1. **Install Dependencies**
   ```bash
   cd SchedulizerEMS-/frontend
   npm install
   ```

2. **Environment Configuration**
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎯 Usage Guide

### 1. Access Room Management
- Navigate to University Dashboard
- Click "Room Management" in Quick Actions section
- Or directly visit `/university/:universityId/rooms`

### 2. View Room Statistics
- **Overview Cards**: Total rooms, labs, classrooms, blocks
- **Block Distribution**: Visual representation of room distribution
- **Real-time Updates**: Statistics update automatically

### 3. Filter and Search Rooms
- **Basic Filters**: Block, room type, search text
- **Advanced Filters**: Floor, capacity, status, department
- **Active Filters**: Visual display of applied filters
- **Reset Filters**: Clear all filters with one click

### 4. Manage Rooms
- **Add New Room**: Click "Add New Room" button
- **Edit Room**: Click edit button on any room card
- **Delete Room**: Click delete button (disabled if room has assignments)
- **View Details**: Click "View Details" for comprehensive information

### 5. Room Form Fields
- **Basic Info**: Name, code, academic block
- **Physical Properties**: Floor, capacity, room type
- **Availability**: 24-hour time slot selection
- **Department**: Optional department assignment

## 🔧 Configuration

### Academic Block Setup
1. **Create Blocks**: Use Prisma Studio or direct database insertion
2. **Block Codes**: Use consistent naming (e.g., ACAD, GBLK, DIGI)
3. **Location**: Add campus/building information
4. **Status**: Set active/inactive as needed

### Room Configuration
1. **Naming Convention**: Use descriptive names (e.g., "Computer Lab 1")
2. **Code Format**: Follow pattern `BLOCK-FLOOR-ROOM` (e.g., "ACAD-1-01")
3. **Capacity Planning**: Set realistic student capacity
4. **Availability**: Configure time slots based on institution schedule

## 📱 User Interface

### Dashboard Layout
- **Header Section**: Title, description, action buttons
- **Statistics Cards**: Key metrics with visual indicators
- **Filter Panel**: Collapsible advanced filtering options
- **Room Grid**: Responsive card layout with pagination
- **Modal Forms**: Clean, focused input forms

### Responsive Design
- **Mobile First**: Optimized for all screen sizes
- **Grid Layout**: Adaptive columns based on viewport
- **Touch Friendly**: Large touch targets and gestures
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

### Authentication
- **JWT Tokens**: Secure API access
- **Route Protection**: Protected CRUD operations
- **User Validation**: University-level access control

### Data Validation
- **Input Sanitization**: Prevent injection attacks
- **Business Rules**: Assignment protection for deletion
- **Error Handling**: Comprehensive error messages

## 📊 Performance Features

### Optimization
- **Pagination**: Efficient data loading
- **Lazy Loading**: Load data on demand
- **Caching**: Minimize API calls
- **Debounced Search**: Reduce server load

### Database
- **Indexed Queries**: Fast room searches
- **Efficient Joins**: Optimized data relationships
- **Connection Pooling**: Database performance

## 🚨 Error Handling

### User Experience
- **Clear Messages**: Descriptive error descriptions
- **Recovery Options**: Suggested solutions
- **Loading States**: Visual feedback during operations
- **Validation Errors**: Field-specific error display

### System Monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **User Analytics**: Usage pattern analysis

## 🔄 Future Enhancements

### Planned Features
- **Room Booking System**: Schedule room reservations
- **Conflict Detection**: Prevent double-booking
- **Reporting**: Advanced analytics and reports
- **Integration**: Connect with scheduling systems
- **Mobile App**: Native mobile application

### Scalability
- **Microservices**: Break down into smaller services
- **Caching Layer**: Redis for performance
- **Load Balancing**: Handle high traffic
- **Database Sharding**: Scale data storage

## 🐛 Troubleshooting

### Common Issues
1. **CORS Errors**: Ensure backend CORS configuration
2. **Database Connection**: Check DATABASE_URL in .env
3. **Port Conflicts**: Verify PORT configuration
4. **Authentication**: Check JWT_SECRET configuration

### Debug Mode
- **Backend Logs**: Check console for detailed errors
- **Network Tab**: Monitor API requests in browser
- **Prisma Studio**: Visual database management
- **Environment Variables**: Verify .env file setup

## 📚 API Documentation

### Request Examples
```bash
# Get rooms with filters
GET /api/v1/rooms?blockId=123&capacity=30&isLab=false

# Create new room
POST /api/v1/rooms
{
  "name": "Computer Lab 1",
  "code": "ACAD-101",
  "floor": 1,
  "capacity": 30,
  "isLab": true,
  "academicBlockId": "block-uuid"
}

# Get rooms by block
GET /api/v1/rooms/block/block-uuid?floor=1&capacity=20
```

### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit pull request

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing framework

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Create GitHub issue with details
- **Discussions**: Use GitHub discussions for questions
- **Email**: Contact development team

### Reporting Bugs
- **Environment**: OS, Node.js version, database
- **Steps**: Detailed reproduction steps
- **Expected vs Actual**: Clear behavior description
- **Logs**: Relevant error messages and logs

---

**Built with ❤️ for Academic Institutions**
