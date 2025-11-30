IMPORTANT — READ THIS FIRST BEFORE WRITING ANY CODE:

You MUST follow these rules when working in this project:

=====================================================
1. BEFORE MAKING ANY CHANGE:
=====================================================
• First READ the entire repository structure.  
• Identify the correct files, components, modules, handlers, and hooks that relate to the requested feature.  
• DO NOT create duplicate components unless absolutely necessary.  
• DO NOT add new components if an existing one already handles part of the logic.  
• ALWAYS reference and use the existing architecture.  
• ONLY edit the exact files responsible for the current UI element or logic.

Example:
If user says “Update Upload Image logic,” you MUST:
– Search for Upload Image button component
– Search for related handlers, utilities, and stores
– Update ONLY those files
– Without restructuring anything

=====================================================
2. DO NOT MODIFY UI LAYOUT (CRITICAL)
=====================================================
• DO NOT change the visual layout, structure, CSS, or HTML of:
  - Left sidebar buttons (Upload Image, Add Text, My Library, Graphics, Templates, Patterns/Textures)
  - Left "My Clothing" panel
  - Product details panel
  - Center mockup/design area layout
  - Front/Back side toggle buttons
  - Zoom controls
  - Top-right navigation (Edit / Preview / Layers)
  - Right "Layers" panel
  - Bottom-right Save Product button

• DO NOT reposition, redesign, or restructure anything.
• DO NOT change margins, width, height, alignment, or CSS classes.
• DO NOT migrate components unless user explicitly approves.

If UI changes are ABSOLUTELY required:
→ ASK THE USER FIRST before touching layout or styling.

=====================================================
3. CANVAS ENGINE RULES
=====================================================
• Use Fabric.js and attach fabric.Canvas ONLY inside the designated design area container.
• Respect the existing Design Area box and do not move it.
• Internal export resolution must always be: 4800 × 5400 px.
• UI canvas should stay scaled—never force UI-size changes.

=====================================================
4. CLOUDINARY RULES
=====================================================
• Always use ORIGINAL URLs (no f_auto, q_auto, w=, h= params).
• Upload only original files (PNG, SVG).
• Respect folder structure: /graphics, /shapes, /textures, /patterns, /user-uploads, /print-files, /mockups.

=====================================================
5. VARIANTS + LAYERS RULES
=====================================================
• Modify only files related to My Clothing panel and Layers panel.
• Adding a variant must not change UI structure.
• Sync Fabric objects with Layers panel properly.

=====================================================
6. TEMPLATE SYSTEM RULES
=====================================================
• Save: canvas.toJSON(), thumbnail, print-ready PNG.
• Load: Auto-scale to print area.
• Modify only template-related files, not UI.

=====================================================
7. EXPORT + MOCKUP RULES
=====================================================
• High DPI export must be 4800 × 5400 px PNG, transparent.
• Mockup generator must NOT modify any UI.
• Insert logic into export-handling files only.

=====================================================
8. ASK THE USER FIRST IF:
=====================================================
• A layout change is needed.
• A component must be moved or renamed.
• A new UI element is required.
• There is ambiguity about which file to modify.

=====================================================
9. CODE STYLE RULES
=====================================================
• Follow existing patterns in this repo.
• Reuse utilities, helper modules, hooks, API calls.
• Do not introduce unnecessary scripts or libraries.
• Follow the repo’s architecture and conventions.

=====================================================
10. WORKFLOW SUMMARY FOR EVERY TASK:
=====================================================
(1) Read entire repo  
(2) Find the related files  
(3) Modify ONLY those files  
(4) Do not touch layout or UI without approval  
(5) Follow existing code patterns  
(6) Ask questions if unclear

=====================================================
END OF RULES
=====================================================
