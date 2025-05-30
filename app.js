import fs from "fs/promises"

async function checkFilter() {
  try {
    const jsonStr = await fs.readFile('extractChat.json', 'utf8');
    
    const allContacts = JSON.parse(jsonStr);

    const filteredContacts = allContacts.filter(
      (el) => el.contact_id === null
    );

    console.log(filteredContacts.length)
    console.log(filteredContacts)
    
    // await fs.writeFile(
    //   'slimmedContacts.json',
    //   JSON.stringify(slimmed, null, 2),
    //   'utf8'
    // );
    // console.log('Written slimmedContacts.json');
  } catch (err) {
    console.error('Error:', err);
  }
}

checkFilter();
