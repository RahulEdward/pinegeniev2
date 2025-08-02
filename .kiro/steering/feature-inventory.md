---
inclusion: always
---

# PineGenie Complete Feature Inventory

## Current Application Features

### 1. Visual Drag-and-Drop Strategy Builder
**Status**: ✅ FULLY FUNCTIONAL - CRITICAL SYSTEM
**Location**: `src/app/builder/`

#### Core Components:
- **Canvas System**: Interactive drag-and-drop interface
- **Node System**: Visual components for strategy building
- **Connection System**: Visual links between nodes
- **State Management**: Zustand-based state for nodes/edges
- **Real-time Validation**: Live strategy validation
- **Pine Script Generation**: Zero-error code generation

#### Node Types Available:
1. **Data Sources**:
   - Market Data (BTCUSDT, timeframes)
   - Custom Data sources
   
2. **Technical Indicators**:
   - RSI (Relative Strength Index)
   - SMA (Simple Moving Average)
   - MACD (Moving Average Convergence Divergence)
   - Bollinger Bands
   - Stochastic Oscillator

3. **Conditions**:
   - Price Conditions (greater_than, less_than, equal_to)
   - Crossover Detection (crosses_above, crosses_below)
   - Range Checks

4. **Actions**:
   - Buy Orders (market, limit, stop)
   - Sell Orders (market, limit, stop)
   - Close Position

5. **Math & Logic**:
   - Calculator (add, subtract, multiply, divide)
   - Comparison operations
   - Absolute values, max, min

6. **Risk Management**:
   - Stop Loss configuration
   - Take Profit settings
   - Position sizing
   - Maximum risk controls

7. **Timing**:
   - Time Filters (trading hours)
   - Timezone support

#### Canvas Features:
- **Zoom Controls**: 10% to 300% zoom levels
- **Pan/Move**: Canvas panning and navigation
- **Background Patterns**: Grid, dots, lines, clean
- **Theme Support**: Dark/light mode integration
- **Responsive Design**: Works on all screen sizes

#### Strategy Management:
- **Save/Load**: Strategy persistence
- **Export**: Multiple export formats
- **Templates**: Pre-built strategy templates
- **Validation**: Real-time strategy validation
- **History**: Undo/redo functionality

### 2. Pine Script Template System
**Status**: ✅ FULLY FUNCTIONAL - CRITICAL SYSTEM
**Location**: `src/agents/pinegenie-agent/core/pine-generator/`

#### Available Templates:
1. **Simple Moving Average Crossover** (Beginner)
   - Dual MA crossover with risk management
   - Customizable periods and stop loss/take profit

2. **RSI Oversold/Overbought** (Beginner)
   - RSI-based mean reversion
   - Dynamic thresholds and risk/reward ratios

3. **Bollinger Bands Breakout** (Intermediate)
   - Advanced BB breakout with volume confirmation
   - Multiple exit strategies and volatility filtering

4. **MACD Signal Strategy** (Intermediate)
   - MACD crossovers with histogram confirmation
   - Trend filtering and multiple exit strategies

5. **EMA Stochastic Scalping** (Advanced)
   - High-frequency scalping with tight stops
   - Time-based exits and quick signal processing

6. **Support/Resistance Breakout** (Advanced)
   - Dynamic S/R level detection
   - Volume confirmation and retest entries

#### Template Features:
- **Parameter Validation**: Type checking and range validation
- **Search System**: Multi-criteria search and filtering
- **Categories**: Organized by strategy type and difficulty
- **Customization**: Parameter injection and modification
- **Pine Script v6**: Full compatibility with latest version
- **Documentation**: Comprehensive usage examples

### 3. Theme and UI System
**Status**: ✅ FULLY FUNCTIONAL - CRITICAL SYSTEM

#### Theme Features:
- **Dark/Light Mode**: Seamless theme switching
- **Color Consistency**: Unified color palette across app
- **Responsive Design**: Mobile, tablet, desktop support
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Gradient Accents**: Beautiful gradient color schemes
- **Animation System**: Smooth transitions and micro-interactions

#### UI Components:
- **Navigation**: Responsive navigation system
- **Sidebar**: Collapsible component sidebar
- **Toolbar**: Feature-rich toolbar with controls
- **Status Bar**: Real-time system status
- **Modals**: User manual and help system
- **Cards**: Information display cards
- **Buttons**: Consistent button styling
- **Forms**: Input validation and styling

### 4. Authentication System
**Status**: ✅ FUNCTIONAL
**Location**: `src/app/login/`, `src/app/register/`

#### Features:
- **User Registration**: Account creation
- **User Login**: Authentication system
- **Session Management**: Secure session handling
- **Admin System**: Administrative controls
- **Database Integration**: User data persistence

### 5. Database System
**Status**: ✅ FUNCTIONAL
**Location**: `prisma/`

#### Current Schema:
- **Users**: User account management
- **Strategies**: Strategy storage and versioning
- **Admin**: Administrative functionality
- **Conversations**: Agent conversation history (if implemented)

#### Features:
- **Prisma ORM**: Type-safe database operations
- **Migrations**: Database schema versioning
- **Seeding**: Initial data setup
- **Backup**: Data persistence and recovery

### 6. API System
**Status**: ✅ FUNCTIONAL
**Location**: `src/app/api/`

#### Available Endpoints:
- **Authentication**: Login/register endpoints
- **Strategies**: Strategy CRUD operations
- **AI Chat**: AI conversation endpoints
- **Admin**: Administrative API endpoints
- **Pine Genie**: Strategy generation endpoints

### 7. AI Integration
**Status**: ✅ FUNCTIONAL
**Location**: `src/app/ai-chat/`

#### Current AI Features:
- **Chat Interface**: Conversational AI interface
- **Strategy Generation**: AI-powered strategy creation
- **OpenAI Integration**: GPT model integration
- **Anthropic Integration**: Claude model integration
- **Context Management**: Conversation context handling

### 8. Landing Page System
**Status**: ✅ FUNCTIONAL
**Location**: `src/app/page.tsx`

#### Features:
- **Interactive Demo**: Live strategy builder preview
- **Feature Showcase**: Comprehensive feature display
- **Testimonials**: User testimonials and reviews
- **FAQ System**: Frequently asked questions
- **Responsive Design**: Mobile-first design
- **Animation System**: Engaging animations and transitions

## Protected Features (DO NOT MODIFY)

### Critical Systems:
1. **Visual Builder** - Core drag-and-drop functionality
2. **Pine Script Generation** - Zero-error code generation
3. **Template System** - Strategy template management
4. **Theme System** - UI consistency and theming
5. **Database Schema** - Data structure and relationships
6. **Node System** - Visual component system

### Integration Points for New Features:

#### Safe Integration Areas:
- **New Chat Components**: Add in `src/agents/pinegenie-agent/components/`
- **New API Endpoints**: Add in `src/app/api/ai-chat/` or similar
- **New Database Tables**: Add with proper migrations
- **New Utility Functions**: Add without affecting existing ones

#### Restricted Areas:
- **Builder Core**: `src/app/builder/` (entire system)
- **Template Core**: `src/agents/pinegenie-agent/core/pine-generator/templates.ts`
- **Database Schema**: Without proper migrations
- **Theme Files**: That affect entire app
- **Tested Components**: Files with existing test coverage

## Development Workflow for New Features

### 1. Pre-Development:
- Review this feature inventory
- Identify integration points
- Plan isolation strategy
- Check for conflicts with existing features

### 2. During Development:
- Test existing features frequently
- Use feature flags for new functionality
- Maintain backward compatibility
- Document any necessary changes

### 3. Pre-Deployment:
- Run comprehensive test suite
- Verify all protected features work
- Test theme consistency
- Validate database integrity
- Check API endpoint functionality

## Quality Assurance Checklist

### Builder System:
- [ ] Drag and drop works correctly
- [ ] Node connections function properly
- [ ] Pine Script generation produces valid code
- [ ] Canvas controls (zoom, pan) work
- [ ] Theme switching maintains consistency
- [ ] Strategy save/load functions correctly

### Template System:
- [ ] All templates generate valid Pine Script
- [ ] Parameter validation works correctly
- [ ] Search and filtering function properly
- [ ] Template customization works
- [ ] Documentation is accessible

### UI/UX:
- [ ] Theme consistency across all pages
- [ ] Responsive design on all devices
- [ ] Animations and transitions work smoothly
- [ ] Navigation functions correctly
- [ ] Forms validate properly

### Backend:
- [ ] Database operations work correctly
- [ ] API endpoints respond properly
- [ ] Authentication system functions
- [ ] Data persistence works
- [ ] Error handling is appropriate

## Monitoring and Maintenance

### Key Performance Indicators:
- Builder load time < 2 seconds
- Pine Script generation success rate > 99%
- Template system response time < 500ms
- Theme switching time < 100ms
- Database query response time < 200ms

### Regular Maintenance Tasks:
- Update dependencies safely
- Run security audits
- Backup database regularly
- Monitor error logs
- Update documentation

## Conclusion

This feature inventory serves as a comprehensive reference for all existing PineGenie functionality. Any new development must respect these existing features and follow the integration guidelines to ensure system stability and user experience consistency.

**Key Principle**: Extend, don't break. Always add new functionality in a way that preserves existing features and maintains the high-quality user experience that PineGenie provides.