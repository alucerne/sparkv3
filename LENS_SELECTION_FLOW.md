# Lens Selection Flow - How It Works

## ✅ **Fully Integrated and Deployed**

### **Staging URL**: https://spark-85t2c8vey-deeeps-projects-8d9261fd.vercel.app

## 🔄 **Complete User Flow**

### **Step 1: Select "Create Custom Model"**
1. **User clicks** the "Tools" button in the chat interface
2. **Dropdown opens** showing two options:
   - "Find Audience" (default)
   - "Create Custom Model"
3. **User selects** "Create Custom Model"
4. **System triggers** `handleSparkModeChange('custom')`

### **Step 2: LensSelector Appears**
1. **LensSelector component** automatically appears in the chat
2. **6 lens cards** are displayed in a responsive grid:
   - Brand, Product, Solution, Function, Service, Event
3. **Each card shows**:
   - Lens name (bold)
   - Description
   - Relevant icon
4. **User can click** any lens card to select it

### **Step 3: Lens Selection**
1. **User clicks** a lens card (e.g., "Brand")
2. **Visual feedback** shows selection (blue border/background)
3. **System calls** `handleLensSelected('Brand')`
4. **LensSelector disappears** from chat
5. **Confirmation message** appears: "Great! You've selected the **Brand** lens for creating your custom model. Now describe what you want to create with this perspective."

### **Step 4: Continue with Custom Model Creation**
1. **User can now type** in the chat input
2. **Placeholder text** changes to: "Describe the custom model you want to create..."
3. **Ready for next milestone** in the custom model creation process

## 🎯 **Technical Implementation**

### **State Management**
```typescript
const [sparkMode, setSparkMode] = useState<'find' | 'custom'>('find');
const [showLensSelector, setShowLensSelector] = useState(false);
const [selectedLens, setSelectedLens] = useState<string>('');
```

### **Key Functions**

#### **handleSparkModeChange**
```typescript
const handleSparkModeChange = (mode: 'find' | 'custom') => {
  setSparkMode(mode);
  
  if (mode === 'custom') {
    setShowLensSelector(true);
    setShowQuerySelection(false);
    setSelectedQuery('');
  } else {
    setShowLensSelector(false);
    setSelectedLens('');
  }
};
```

#### **handleLensSelected**
```typescript
const handleLensSelected = (lens: string) => {
  setSelectedLens(lens);
  
  const lensMessage: Message = {
    id: Date.now().toString(),
    role: 'assistant',
    content: `Great! You've selected the **${lens}** lens for creating your custom model. Now describe what you want to create with this perspective.`,
    timestamp: new Date(),
  };
  
  setMessages(prev => [...prev, lensMessage]);
  setShowLensSelector(false);
};
```

### **UI Integration**
```tsx
{showLensSelector && (
  <div className="flex justify-start">
    <div className="bg-gray-100 rounded-lg p-4 w-full">
      <LensSelector onLensSelected={handleLensSelected} />
    </div>
  </div>
)}
```

## 🧪 **Testing the Flow**

### **Manual Testing Steps**
1. **Visit**: https://spark-85t2c8vey-deeeps-projects-8d9261fd.vercel.app
2. **Click** the "Tools" button above the chat input
3. **Select** "Create Custom Model" from the dropdown
4. **Verify** the LensSelector appears in the chat area
5. **Click** any lens card (e.g., "Brand")
6. **Verify** the lens selector disappears and confirmation message appears
7. **Check** that the input placeholder changes to custom model text

### **Expected Behavior**
- ✅ Tools dropdown opens and closes properly
- ✅ LensSelector appears when "Create Custom Model" is selected
- ✅ All 6 lens cards are visible and clickable
- ✅ Selection provides visual feedback
- ✅ Confirmation message appears after selection
- ✅ Input placeholder updates appropriately
- ✅ Switching back to "Find Audience" hides lens selector

## 🎨 **Visual Design**

### **LensSelector Appearance**
- **Location**: Appears in the chat messages area
- **Background**: Light gray background to match chat style
- **Layout**: Responsive grid (1 column mobile, 2 columns desktop)
- **Cards**: Clean, modern design with hover effects

### **Selection States**
- **Default**: Gray border, white background
- **Hover**: Enhanced shadow, darker border
- **Selected**: Blue border, light blue background, blue text

### **Icons**
- **Brand**: Building2 icon
- **Product**: Package icon
- **Solution**: Target icon
- **Function**: Settings icon
- **Service**: Wrench icon
- **Event**: Calendar icon

## 🔄 **Flow States**

### **State 1: Default (Find Audience)**
- Tools dropdown shows "Find Audience" selected
- No lens selector visible
- Input placeholder: "Describe what audience segments you're looking for..."

### **State 2: Create Custom Model Selected**
- Tools dropdown shows "Create Custom Model" selected
- LensSelector appears in chat
- Input placeholder: "Describe the custom model you want to create..."

### **State 3: Lens Selected**
- LensSelector disappears
- Confirmation message appears in chat
- Input placeholder: "Describe the custom model you want to create..."
- Ready for user input

## 🚀 **Ready for Next Milestone**

The lens selection flow is now **fully functional** and ready for the next phase of custom model creation. Users can:

1. ✅ Switch between "Find Audience" and "Create Custom Model" modes
2. ✅ Select from 6 different lenses
3. ✅ Get visual feedback and confirmation
4. ✅ Continue with the custom model creation process

**The foundation is set for implementing the next milestone in the Create Custom Model functionality!**

---

**Implementation Date**: July 31, 2025  
**Status**: ✅ Complete and Deployed  
**Environment**: Staging  
**Flow**: Fully Integrated  
**Ready for**: Next milestone implementation 