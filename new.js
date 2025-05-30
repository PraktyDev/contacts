import fs from "fs/promises";
import path from "path";

async function fillMissingContactIds() {
  try {
    const [rawExtract, rawLookup] = await Promise.all([
      fs.readFile(path.resolve("extractChat.json"), "utf8"),
      fs.readFile(path.resolve("slimmedContacts.json"), "utf8"),
    ]);
    const extractChats = JSON.parse(rawExtract);
    const lookupContacts = JSON.parse(rawLookup);

    // build lookup: lowercase(contactName) → contactId
    const nameToId = lookupContacts.reduce((map, { contactName, contactId }) => {
      if (contactName && contactId) {
        map[contactName.trim().toLowerCase()] = contactId;
      }
      return map;
    }, /** @type {Record<string,string>} */ ({}));

    const unmatched = new Set();

    const patched = extractChats.map((entry) => {
      if (!entry.contact_id) {
        let name = entry.contact_name;
        if (typeof name !== "string") {
          unmatched.add(String(name));
          return entry;
        }

        // 1) strip trailing digits (e.g. "Julius Tona 2" → "Julius Tona")
        // 2) collapse whitespace, trim, toLowerCase
        name = name
          .replace(/\s+\d+$/, "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        // if it looks like a phone number (digits, parentheses, dashes) or literally "null", skip
        if (/^[\d\-\(\)\s]+$/.test(name) || name === "null") {
          console.warn(`⚠️ Skipping phone/# or "null": ${entry.contact_name}`);
          unmatched.add(entry.contact_name);
          return entry;
        }

        const foundId = nameToId[name];
        if (foundId) {
          entry.contact_id = foundId;
        } else {
          console.warn(`⚠️ No lookup entry for "${entry.contact_name}" → normalized "${name}"`);
          unmatched.add(entry.contact_name);
        }
      }
      return entry;
    });

    // write out the filled data
    await fs.writeFile(
      path.resolve("conversations.json"),
      JSON.stringify(patched, null, 2),
      "utf8"
    );
    console.log(`✅ Done: conversations.json (${patched.length} records)`);

    // also dump all names we couldn’t match for manual review
    await fs.writeFile(
      path.resolve("unmatchedNames.json"),
      JSON.stringify(Array.from(unmatched), null, 2),
      "utf8"
    );
    console.log(`ℹ️  Wrote ${unmatched.size} unmatched names to unmatchedNames.json`);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

fillMissingContactIds();
