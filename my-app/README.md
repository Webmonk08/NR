# Visual Data Workflow Builder

A powerful, interactive visual workflow builder for data processing, transformation, and analysis built with Next.js, React Flow, and TypeScript. Create data pipelines by dragging and dropping nodes in an intuitive visual interface.

## 🚀 Features

### Visual Workflow Creation
- **Drag & Drop Interface**: Intuitive node-based workflow creation
- **Real-time Connections**: Connect nodes to create data processing pipelines
- **Visual Flow Management**: See your data flow visually with React Flow

### Data Processing Categories

#### 📊 Data Sources
- **File Import**: Upload and process various file formats
- **CSV File Import**: Specialized CSV file handling with column detection
- **Datasets**: Access to built-in sample datasets
- **SQL Table**: Connect to SQL databases
- **Data Table**: Manual data entry and editing

#### 🔄 Data Transformation
- **Data Sampler**: Extract samples from large datasets
- **Select Columns**: Choose specific columns for analysis
- **Select Rows**: Filter rows by range or criteria
- **Transpose**: Rotate data tables (rows ↔ columns)
- **Advanced Filter**: Filter data with multiple conditions and operators

#### 🤖 Machine Learning Models
- **k-Nearest Neighbors (kNN)**: Classification and regression
- **Decision Tree**: Tree-based learning algorithm
- **Random Forest**: Ensemble learning with multiple trees
- **Support Vector Machine (SVM)**: Advanced classification algorithm

#### 📈 Data Visualization
- **Box Plot**: Statistical distribution visualization
- **Scatter Plot**: Correlation and relationship analysis
- **Line Plot**: Time series and trend visualization
- **Bar Plot**: Categorical data comparison

### Interactive Features

#### Enhanced Multi-File Management 🆕
- **Node-Specific File Storage**: Each node maintains its own file data independently
- **Multiple File Support**: Upload different files to different nodes simultaneously
- **Data Flow Tracking**: Automatic parent-child data relationship management
- **Smart Data Propagation**: Changes automatically flow to connected downstream nodes
- **Data Lineage**: Clear tracking of data sources and transformations

#### Node Inspector
- **Parameter Configuration**: Customize each node's behavior
- **Data Preview**: View processed data in real-time (node-specific or inherited)
- **Status Monitoring**: Track execution status and errors per node
- **File Upload**: Direct file upload for individual data nodes
- **Column Selection**: Interactive column picker with inherited column support

#### Advanced Workflow Management
- **Save/Load Workflows**: Persist and restore complex workflows with multiple files
- **Workflow Execution**: Run entire pipelines with one click
- **Real-time Processing**: See data flow through your pipeline
- **Error Handling**: Comprehensive error detection and reporting

#### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Themes**: Customizable appearance
- **Minimap**: Navigate large workflows easily
- **Grid Snap**: Align nodes perfectly
- **Zoom Controls**: Precise viewport management
- **Keyboard Shortcuts**: Power user efficiency

## 🛠 Tech Stack

- **Frontend**: Next.js 15.5.0, React 19.1.0, TypeScript
- **Flow Editor**: React Flow (@xyflow/react)
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit/core
- **Data Visualization**: D3.js, Recharts
- **UI Components**: Tailwind CSS, Lucide React
- **File Handling**: React Dropzone
- **Data Grid**: React Data Grid

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install

   # Using yarn
   yarn install

   # Using pnpm
   pnpm install

   # Using bun
   bun install
   ```

3. **Run the development server**
   ```bash
   # Using npm
   npm run dev

   # Using yarn
   yarn dev

   # Using pnpm
   pnpm dev

   # Using bun
   bun dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## 📖 How to Use

### Creating Your First Workflow

1. **Start with Data**: Drag a data source node (File, CSV, or Dataset) to the canvas
2. **Add Transformations**: Connect transformation nodes to process your data
3. **Apply Models**: Add machine learning nodes for analysis
4. **Visualize Results**: Connect visualization nodes to see your results
5. **Configure Nodes**: Click on any node to open the inspector and configure parameters
6. **Run Workflow**: Click the play button to execute your entire pipeline

### Example Multi-File Workflows

#### Simple Analysis Pipeline
```
[CSV File A] → [Select Columns] → [Filter] → [Scatter Plot]
     ↓
[Data Sampler] → [kNN Model] → [Box Plot]
```

#### Advanced Multi-Source Analysis 🆕
```
[customers.csv] → [Filter Active] ↘
                                  [Merge Node] → [Analysis] → [Dashboard]
[orders.csv] → [Sample Recent] ↗

[inventory.csv] → [Group by Category] → [Bar Chart]
```

**Key Benefits:**
- Each CSV node maintains independent data
- Multiple files processed simultaneously  
- Data flows tracked automatically
- No cross-contamination between file sources

### Node Configuration

#### Data Nodes
- **File/CSV**: Upload files and automatically detect columns
- **Parameters**: File format, encoding, delimiter settings

#### Transform Nodes
- **Select Columns**: Choose specific columns by name
- **Filter**: Set conditions (==, !=, >, <, contains, etc.)
- **Sampler**: Set sample size and method

#### Model Nodes
- **kNN**: Configure k-value and distance metric
- **Tree**: Set max depth, min samples split
- **Random Forest**: Configure number of estimators

#### Visualization Nodes
- **Scatter Plot**: Choose X/Y axes, color coding
- **Box Plot**: Select categories and value columns
- **Charts**: Configure axes, colors, and styling

## 🏗 Project Structure

```
my-app/
├── app/
│   ├── components/           # React components
│   │   ├── customNode.tsx   # Custom node implementation
│   │   ├── sidenav.tsx      # Tool sidebar
│   │   ├── toolbar.tsx      # Top toolbar with controls
│   │   ├── nodeInspector/   # Node configuration panel
│   │   └── visualizations/  # Chart components
│   ├── data/                # Static data and configurations
│   ├── services/            # Business logic and utilities
│   ├── store/               # State management (Zustand)
│   ├── types/               # TypeScript type definitions
│   └── page.tsx             # Main application component
├── public/                  # Static assets
└── package.json            # Project dependencies
```

## 🎯 Key Components

### Core Components
- **`page.tsx`**: Main application orchestrating the entire workflow
- **`droppableMainArea.tsx`**: Canvas area for node placement
- **`customNode.tsx`**: Individual node rendering and interaction
- **`sidenav.tsx`**: Categorized tool palette

### Services
- **`NodeRelationshipService`**: Manages data flow between connected nodes
- **`FileService`**: Handles file uploads and processing
- **`useFlowStore`**: Global state management for workflow data

### Types
- **`toolItem.ts`**: Tool definitions and categories
- **`nodeData.ts`**: Node data structure
- **`nodeTypes.ts`**: Available node types

## 🔧 Configuration

### Node Configuration (`nodeConfig.ts`)
Define parameters and behavior for each node type:

```typescript
export const nodeConfigs = {
  'filter-more': {
    parameters: {
      column: { type: 'select', options: 'dynamic' },
      operator: { type: 'select', options: ['==', '!=', '>', '<'] },
      value: { type: 'text' }
    }
  }
  // ... more configurations
}
```

### Environment Variables
```env
# Add any required environment variables
NEXT_PUBLIC_API_URL=your_api_url
```

## 🔮 Advanced Features

### Enhanced Multi-File Data Management 🆕

#### Node-Specific Data Storage
```typescript
// Each node stores its own file data independently
nodeDataStore: {
  'node-1': { 
    fileData: { fileId: 'csv1', data: [...], columns: [...] },
    processedData: [...],
    status: 'success'
  },
  'node-2': { 
    fileData: { fileId: 'csv2', data: [...], columns: [...] },
    processedData: [...],
    status: 'success'  
  }
}
```

#### Smart Data Flow System
- **Parent-Child Tracking**: Automatic relationship management between connected nodes
- **Data Inheritance**: Child nodes automatically receive parent node data
- **Multi-Source Merging**: Nodes can combine data from multiple parent sources
- **Propagation Control**: Changes flow downstream while preserving upstream data

#### Data Priority System
```
Node Data Priority (Highest to Lowest):
1. Processed Data (after transformation)
2. File Data (uploaded files)  
3. Inherited Data (from parent nodes)
4. Default/Mock Data (for testing)
```

### Performance Optimization
- **Virtual Rendering**: Efficient handling of large datasets across multiple files
- **Selective Processing**: Only affected nodes reprocess when data changes
- **Memory Management**: Per-node data isolation prevents memory leaks
- **Background Processing**: Non-blocking workflow execution with multiple files

### Workflow Capabilities
- **Complex Branching**: Support for multi-source, multi-destination workflows
- **Data Lineage**: Complete tracking of data source and transformation history  
- **Independent Processing**: Multiple file processing pipelines run simultaneously
- **Cross-File Analysis**: Merge and compare data from different file sources

## 🐛 Troubleshooting

### Common Issues

1. **Nodes not connecting**: Ensure nodes are compatible (check input/output types)
2. **Data not flowing**: Verify all required parameters are set
3. **Visualization not showing**: Check data format and column names
4. **Performance issues**: Reduce dataset size or use sampling

### Debug Mode
Enable detailed logging by setting:
```javascript
localStorage.setItem('debug', 'true')
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Write tests for new features
- Maintain consistent code formatting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Flow** - For the excellent flow editor library
- **D3.js** - For powerful data visualization capabilities
- **Tailwind CSS** - For beautiful, responsive styling
- **Lucide React** - For comprehensive icon library

## 📊 Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] Cloud data source integration
- [ ] Advanced ML algorithms
- [ ] Custom node creation UI
- [ ] Workflow templates
- [ ] Performance analytics
- [ ] Export to various formats
- [ ] Version control for workflows

### Version History
- **v0.1.0** - Initial release with core functionality
- Basic node system and workflow creation
- Essential data transformations
- Core visualization types

---

## 🚀 Quick Start Example

```javascript
// Example: Creating a simple data analysis workflow
1. Drag "CSV File" → Upload your data
2. Drag "Select Columns" → Choose relevant columns
3. Drag "Filter" → Apply conditions
4. Drag "Scatter Plot" → Visualize results
5. Click "Run Workflow" → See your analysis!
```

For more detailed documentation and examples, visit our [documentation site](#) or check the `/docs` folder.

**Built with ❤️ using Next.js and React Flow**
