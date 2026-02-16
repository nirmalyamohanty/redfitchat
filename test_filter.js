import Filter from 'bad-words';
const filter = new Filter();
const odiaText = "ଓଡ଼ିଆ"; // Odia text
try {
    console.log("Original:", odiaText);
    console.log("Cleaned:", filter.clean(odiaText));
    console.log("Is Profane:", filter.isProfane(odiaText));
} catch (e) {
    console.error("Error:", e.message);
}
