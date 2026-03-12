/**
 * =========================================================================
 * 🛠️ UNIVERSAL INVENTORY & BOOKING SYSTEM (MASTER TEMPLATE)
 * =========================================================================
 * * Welcome! If you are reading this, you have been given the keys to an 
 * automated booking, scheduling, and inventory system. You do NOT need 
 * to be a coder to use this.
 * * 📖 HOW TO SET THIS UP (ONE-TIME SETUP):
 * 1. Scroll down to "STEP 1: CONFIGURATION".
 * 2. Change the text inside the quotation marks to match your organization.
 * 3. Click the "Save" icon (the floppy disk) at the top.
 * 4. At the top of the screen, find the dropdown menu that says "buildTemplate".
 * 5. Click "Run". 
 * 6. Google will ask for Permissions. Click "Review Permissions" -> Choose 
 * your Google account -> Click "Advanced" -> Click "Go to script (unsafe)" 
 * -> Click "Allow".
 * 7. Wait about 30 seconds. Look at the "Execution Log" at the bottom of the 
 * screen. It will print out the official links to your new Spreadsheet and Form!
 * * 📝 HOW TO MANAGE YOUR SHIFTS / INVENTORY:
 * 1. Open your new Spreadsheet. Go to the "1. Inventory Settings" tab.
 * 2. Type your shifts, items, or time slots in Column A.
 * 3. Type how many spots are available in Column B.
 * 4. DO NOT type in Columns C, D, or E. The system calculates those automatically!
 * * 👤 HOW TO MANAGE YOUR APPROVED USERS:
 * 1. Go to the "2. Allowed Users" tab in your spreadsheet.
 * 2. Paste the First and Last names of the people allowed to sign up. 
 * (This prevents typos and fake sign-ups).
 * * 🔄 HOW TO UPDATE THE LIVE FORM:
 * 1. Whenever you change a shift time or add a new user to your spreadsheet, 
 * you need to tell the Form to update.
 * 2. Look at the very top menu bar of your Spreadsheet (next to File, Edit, View).
 * 3. Click the "🛠️ Admin Tools" menu, then click "Sync Updates to Live Form".
 * * =========================================================================
 */

// 👇 STEP 1: CONFIGURATION (CUSTOMIZE YOUR DETAILS HERE) 👇

// --- General Form Details ---
const ORG_NAME = "My Awesome Organization"; 
const FORM_TITLE = "Spring Event Volunteer Sign-Up";
const FORM_DESCRIPTION = "Thank you for volunteering! Please select your name and choose an open shift below. Once a shift is full, it will disappear from this list automatically.";

// --- Question Titles ---
const NAME_QUESTION_TITLE = "Select Your Name:";
const SHIFT_QUESTION_TITLE = "Select an Available Shift:"; 

// --- Automated Email Confirmation Details ---
// The system will automatically email a receipt to the user.
// You can use [Name] and [Shift] in the body, and the system will replace them!
const EMAIL_SUBJECT = "Confirmation: Your Shift is Booked!";
const EMAIL_BODY = "Hello [Name],\n\nThank you for signing up! This email confirms you are successfully scheduled for the following shift:\n\n[Shift]\n\nIf you need to cancel or change this, please contact the coordinator directly.\n\nThank you,\n" + ORG_NAME;

// 🛑 STOP HERE! 🛑
// You do not need to change anything below this line!
// =========================================================================



/**
 * =========================================================================
 * ⚙️ THE ENGINE ROOM (CORE LOGIC)
 * =========================================================================
 */

const TEMPLATE_VERSION = "v2.0.0-Universal";

/**
 * Builds the entire environment from scratch.
 */
function buildTemplate() {
  // 1. Create Spreadsheet
  const ssName = `${ORG_NAME} - Booking Database`;
  const ss = SpreadsheetApp.create(ssName);
  const ssId = ss.getId();
  
  // 2. Setup Inventory Tab
  const inventorySheet = ss.getActiveSheet().setName("1. Inventory Settings");
  inventorySheet.appendRow(["Shift / Item Name", "Total Slots Available", "Slots Taken", "Remaining Slots", "Status"]);
  
  const sampleShifts = [
    ["Saturday - Morning Shift (8am - 12pm)", 3, 0],
    ["Saturday - Afternoon Shift (12pm - 4pm)", 3, 0],
    ["Sunday - Morning Shift (8am - 12pm)", 2, 0]
  ];
  sampleShifts.forEach(shift => inventorySheet.appendRow([shift[0], shift[1], shift[2], 0, ""]));

  // 3. Setup Allowed Users Tab
  const userSheet = ss.insertSheet("2. Allowed Users");
  userSheet.appendRow(["First Name", "Last Name"]);
  const sampleUsers = [
    ["Jane", "Doe"],
    ["John", "Smith"],
    ["Test", "User"]
  ];
  sampleUsers.forEach(user => userSheet.appendRow(user));

  // 4. Create Live Form
  const form = FormApp.create(`${FORM_TITLE} - Live`);
  form.setDescription(FORM_DESCRIPTION)
      .setDestination(FormApp.DestinationType.SPREADSHEET, ssId)
      .setCollectEmail(true); 
  
  // 5. Add Name Dropdown
  const namesList = sampleUsers.map(u => `${u[0]} ${u[1]}`);
  form.addListItem().setTitle(NAME_QUESTION_TITLE).setChoiceValues(namesList).setRequired(true);
  
  // 6. Add Shift Multiple Choice
  const shiftItem = form.addMultipleChoiceItem().setTitle(SHIFT_QUESTION_TITLE).setRequired(true);
  
  // 7. Save IDs to Properties
  PropertiesService.getScriptProperties().setProperties({
    'FORM_ID': form.getId(),
    'QUESTION_ID': shiftItem.getId().toString(),
    'SPREADSHEET_ID': ssId
  });

  SpreadsheetApp.flush();

  // 8. Add Formulas and Formatting to Inventory
  const lastRow = inventorySheet.getLastRow();
  for (let i = 2; i <= lastRow; i++) {
    inventorySheet.getRange(i, 3).setFormula(`=COUNTIF('Form Responses 1'!D:D, A${i})`);
    inventorySheet.getRange(i, 4).setFormula(`=B${i}-C${i}`);
    inventorySheet.getRange(i, 5).setFormula(`=IF(D${i}<=0, "🛑 FULL", "✅ Open")`);
  }
  
  // 9. Create Dashboard Tab
  const dashboard = ss.insertSheet("3. Live Dashboard");
  dashboard.getRange("A1").setValue(`${ORG_NAME} - Live Bookings`).setFontSize(14).setFontWeight("bold");
  dashboard.getRange("A3").setValue("All Confirmed Sign-Ups:").setFontWeight("bold");
  dashboard.getRange("A4").setFormula(`=IFERROR(QUERY('Form Responses 1'!A:D, "SELECT C, D WHERE C IS NOT NULL LABEL C 'Volunteer Name', D 'Shift Booked'", 1), "No sign-ups yet.")`);
  dashboard.setColumnWidth(1, 200); dashboard.setColumnWidth(2, 300);
  ss.moveActiveSheet(1);

  // 10. Setup Automation Trigger
  ScriptApp.newTrigger('onFormSubmitSync').forForm(form).onFormSubmit().create();

  // Sync once to populate
  syncInventoryToForm();

  console.log("🎉 SUCCESS! Your system is built.");
  console.log("📊 Find your Database here: " + ss.getUrl());
  console.log("📝 Find your Live Form here: " + form.getPublishedUrl());
}

/**
 * Reads inventory and updates the Form choices.
 */
function syncInventoryToForm() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty('SPREADSHEET_ID');
  const formId = props.getProperty('FORM_ID');
  const questId = props.getProperty('QUESTION_ID');
  
  if (!ssId || !formId || !questId) return; 

  const ss = SpreadsheetApp.openById(ssId);
  const form = FormApp.openById(formId);
  const inventoryTab = ss.getSheetByName("1. Inventory Settings");
  
  const data = inventoryTab.getDataRange().getValues();
  const openShifts = [];
  
  for (let i = 1; i < data.length; i++) {
    const shiftName = data[i][0];
    const remainingSlots = Number(data[i][3]);
    
    if (remainingSlots > 0 && shiftName !== "") {
      openShifts.push(shiftName);
    }
  }
  
  const questionItem = form.getItemById(Math.trunc(Number(questId))).asMultipleChoiceItem();
  
  if (openShifts.length > 0) {
    questionItem.setChoiceValues(openShifts);
  } else {
    questionItem.setChoiceValues(["All available shifts are currently full!"]);
  }
}

/**
 * Fires automatically on form submit. Syncs inventory and sends emails.
 */
function onFormSubmitSync(e) {
  SpreadsheetApp.flush();
  syncInventoryToForm();
  
  const props = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  const responsesTab = ss.getSheetByName("Form Responses 1");
  if (responsesTab) responsesTab.autoResizeColumns(1, 5);

  // --- Email Automation ---
  try {
    const response = e.response;
    const userEmail = response.getRespondentEmail();
    const itemResponses = response.getItemResponses();
    
    let userName = "Volunteer";
    let bookedShift = "Your Shift";
    
    // Extract answers based on the configured question titles
    itemResponses.forEach(item => {
      const title = item.getItem().getTitle();
      if (title === NAME_QUESTION_TITLE) userName = item.getResponse();
      if (title === SHIFT_QUESTION_TITLE) bookedShift = item.getResponse();
    });

    // Don't send an email if they somehow selected the "Full" message
    if (!bookedShift.includes("full!")) {
      // Replace placeholders with actual data
      let finalBody = EMAIL_BODY.replace("[Name]", userName).replace("[Shift]", bookedShift);
      
      MailApp.sendEmail({
        to: userEmail,
        subject: EMAIL_SUBJECT,
        body: finalBody
      });
    }
  } catch (error) {
    console.error("Email failed to send: " + error);
  }
}

/**
 * Adds the Custom Menu to the Spreadsheet.
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('🛠️ Admin Tools')
      .addItem('Sync Updates to Live Form', 'syncInventoryToForm')
      .addToUi();
  } catch (e) {
    // Fails silently in editor context
  }
}
