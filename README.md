# 🛠️ Universal Google Form Booking & Inventory System

A completely free, automated scheduling and inventory system built on Google Apps Script. 

This tool is designed to replace paid third-party platforms (like SignUpGenius). It uses a Google Form for data collection, a Google Sheet for live inventory management, and automatically hides shifts/items from the live form once they reach capacity.

**Perfect for:** PTA events, sports league volunteer scheduling, church groups, and equipment check-outs.

## ✨ Features
* **Dynamic Inventory:** Shifts automatically disappear from the live Google Form when slots reach zero.
* **Name Validation:** Forces users to pick from a pre-approved list of names to eliminate typos and fake sign-ups.
* **Automated Email Receipts:** Sends a customized confirmation email to the user the moment they sign up.
* **Supervisor Dashboard:** A built-in Google Sheets dashboard gives organizers a real-time, clean overview of all confirmed bookings.
* **Zero Coding Required:** Designed specifically for non-technical users to deploy in under two minutes.

---

## 🚀 How to Set Up (For Non-Coders)

You do not need to know Javascript to use this tool! Just follow these steps:

1. Go to [Google Apps Script](https://script.google.com/) and sign in with your Google account.
2. Click the **New Project** button in the top left corner.
3. Delete any code currently in the editor and **paste the entire contents of `Code.gs`** from this repository.
4. **Customize Your Event:** Look at the very top of the code for `STEP 1: CONFIGURATION`. Change the text inside the quotation marks to match your organization's name, form description, and email receipt message.
5. Click the **Save** icon (the floppy disk) at the top.
6. In the toolbar at the top, find the dropdown menu (it likely says `buildTemplate`). Ensure `buildTemplate` is selected, and click **Run**.
7. **Permissions:** Google will ask for permission to create the files. Click *Review Permissions* -> Choose your account -> Click *Advanced* -> Click *Go to script (unsafe)* -> Click *Allow*.
8. **Done!** Wait about 30 seconds. Look at the `Execution log` at the bottom of your screen. It will print out the official web links to your brand new Database and your Live Form.

---

## 📊 How to Manage Your Event

Once the script runs, it generates a master Google Spreadsheet. This is your "Command Center."

* **1. Inventory Settings:** This tab is where you type in your available shifts or items in Column A, and the total number of slots in Column B. (The system will automatically calculate the rest).
* **2. Allowed Users:** Paste the first and last names of your approved volunteers/users here. Only these names will appear on the live form.
* **3. Live Dashboard:** A clean, read-only view of exactly who has signed up for what.

### 🔄 Syncing Updates
If you ever change a shift time or add a new user to your spreadsheet, you need to update the live form. 
Simply open your Spreadsheet, click the **🛠️ Admin Tools** menu at the top, and select **Sync Updates to Live Form**.

---
*Developed by Bryan*
