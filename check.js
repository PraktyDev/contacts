import fs from "fs/promises"

async function checker() {
  try {
    const jsonStr = await fs.readFile('contacts.json', 'utf8');
    
    const allContacts = JSON.parse(jsonStr);

    const jsonStr2 = await fs.readFile('conversations.json', 'utf8');
    
    const conversations = JSON.parse(jsonStr2);

        console.log("contacts", allContacts.length)
        console.log("conversations",conversations.length)
} catch (err) {
    console.error('Error:', err);
  }
}

checker();