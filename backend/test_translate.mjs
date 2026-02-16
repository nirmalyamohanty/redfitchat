import axios from 'axios';

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

console.log(`Testing MyMemory at: ${MYMEMORY_URL}`);

try {
    // MyMemory usage: GET ?q=text&langpair=source|target
    const text = "Hola mundo";
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=es|en`;
    console.log(`Fetching: ${url}`);

    const { data } = await axios.get(url);
    console.log("Translation success:", data);
} catch (error) {
    console.error("Translation failed:", error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
    }
}
