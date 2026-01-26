import { Canvas, IText, Rect } from 'fabric';

// Simulate what your system does
async function generateExampleJSON() {
  console.log('📋 Example: How Canvas Objects are Stored as JSON\n');
  console.log('═'.repeat(60));
  
  // Create a virtual canvas
  const canvas = new Canvas(null as any, { width: 800, height: 600 });
  
  // Add text object
  const text = new IText('Custom Design', {
    left: 100,
    top: 50,
    fontSize: 40,
    fontFamily: 'Arial',
    fill: '#000000',
    fontWeight: 'bold'
  });
  
  // Add rectangle
  const rect = new Rect({
    left: 100,
    top: 150,
    width: 200,
    height: 100,
    fill: '#ff0000',
    stroke: '#000000',
    strokeWidth: 2
  });
  
  canvas.add(text);
  canvas.add(rect);
  
  // Serialize to JSON (what gets saved to database)
  const canvasJSON = canvas.toJSON();
  
  console.log('\n🎨 VISUAL REPRESENTATION:');
  console.log('┌────────────────────┐');
  console.log('│ "Custom Design"    │ ← Text object');
  console.log('│                    │');
  console.log('│ ┌──────────────┐   │');
  console.log('│ │   Red Box    │   │ ← Rectangle object');
  console.log('│ └──────────────┘   │');
  console.log('└────────────────────┘');
  
  console.log('\n💾 SAVED TO DATABASE (front_canvas_json):');
  console.log('─'.repeat(60));
  console.log(JSON.stringify(canvasJSON, null, 2));
  
  console.log('\n\n📊 JSON SIZE:');
  const jsonString = JSON.stringify(canvasJSON);
  console.log(`Characters: ${jsonString.length}`);
  console.log(`Bytes: ${Buffer.byteLength(jsonString, 'utf8')}`);
  console.log(`Kilobytes: ${(Buffer.byteLength(jsonString, 'utf8') / 1024).toFixed(2)} KB`);
  
  console.log('\n\n🔍 WHAT EACH OBJECT STORES:');
  console.log('─'.repeat(60));
  canvasJSON.objects.forEach((obj: any, index: number) => {
    console.log(`\nObject ${index + 1}: ${obj.type}`);
    console.log(`  Position: (${obj.left}, ${obj.top})`);
    console.log(`  Size: ${obj.width}x${obj.height || 'auto'}`);
    console.log(`  Color: ${obj.fill}`);
    if (obj.type === 'i-text') {
      console.log(`  Text: "${obj.text}"`);
      console.log(`  Font: ${obj.fontFamily} ${obj.fontSize}px`);
    }
    if (obj.type === 'rect') {
      console.log(`  Stroke: ${obj.stroke} (${obj.strokeWidth}px)`);
    }
  });
  
  console.log('\n\n✨ KEY POINTS:');
  console.log('─'.repeat(60));
  console.log('1. ALL object properties are preserved');
  console.log('2. Position, size, rotation, colors, etc.');
  console.log('3. Images are base64-encoded inline');
  console.log('4. Text content, fonts, styles all saved');
  console.log('5. Layer order is maintained');
  console.log('6. Max size: ~64KB for TEXT column');
}

generateExampleJSON();
