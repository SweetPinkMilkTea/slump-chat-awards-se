let flavor_text_map
let response
let data
let annotations

document.addEventListener('DOMContentLoaded', async () => {
    // Get main data
    flavor_text_response = await fetch('data/flavortext.json');
    flavor_text_map = await flavor_text_response.json();
    annotations_response = await fetch('data/notes.json');
    annotations = await annotations_response.json();
    response = await fetch('data/data.json');
    data = await response.json();
    const names = Object.keys(data);
    names.sort(function (a, b) {return a.toLowerCase().localeCompare(b.toLowerCase());});

    // Unranked category logic (+ Checkbox for hiding)
    unrankedSet();
    document.getElementById("hideUnranked").addEventListener("change", unrankedSet);

    dynWidth();

    // Extract data for "prism" tiered awards and set it
    const prism_data = {};
    Object.values(data).forEach(obj => {
        Object.entries(obj).forEach(([key, value]) => {
            if (key.startsWith("team_")) {
                prism_data[key] = (prism_data[key] || 0) + value;
            }
        });
    });
    Object.keys(prism_data).forEach(key => {
        const statElement = document.getElementById(key);
        if (statElement) {
            statElement.querySelector('span').innerHTML = `${prism_data[key]}`;
        }
    })
    
    // Get names and prepare dropdown
    const nameSelect = document.getElementById('nameSelect');
    for (let name in names) {
        const option = document.createElement('option');
        option.value = names[name];
        option.textContent = names[name];
        nameSelect.appendChild(option);
    }

    // Update stats when a name is selected
    nameSelect.addEventListener('change', () => {
        const selectedName = nameSelect.value;
        updateStatStyles(selectedName);
        const statsContainer = document.querySelector('.singlecontainer');
        document.querySelectorAll('.theme .singlecontainer .singlestats').forEach(div => {
            if (!div.id.startsWith("team")) {
                div.querySelector('span').textContent = '---';
            }
        });

        if (selectedName && data[selectedName]) {
            for (let key in data[selectedName]) {
                const statElement = document.getElementById(key);
                if (!key.startsWith("team")) {
                    if (statElement) {
                        statElement.querySelector('span').innerHTML = `${data[selectedName][key]}`;
                    }
                }
            };
        } else {
            statsContainer.querySelectorAll('span').forEach(span => span.textContent = '---');
        }
    });

    // Apply tilt effect for Icons
    document.body.addEventListener('mousemove', (e) => {
		const icon = e.target.closest('.singlecontainer');
        if (!icon) { return; };

        const rect = icon.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

		const w = icon.clientWidth;
		const h = icon.clientHeight;

		icon.style.setProperty('--rx', `${ ((offsetX - (w/2)) / w) * 20 }deg`);
		icon.style.setProperty('--ry', `${ ((offsetY - (h/2)) / h) * -20 }deg`);
    });
});

function updateStatStyles(selectedName) {
    // Reset styling
    document.querySelectorAll('.singlecontainer').forEach(statDiv => {
        statDiv.classList.remove('style_prism', 'style_diamond', 'style_platinum', 'style_gold', 'style_silver', 'style_bronze', 'style_white');
    });
    if (!selectedName || !data[selectedName]) {
        return;
    }

    // Calculate rankings for each stat
    const rankings = {};
    for (let name in data) {
        for (let statKey in data[name]) {
        if (!rankings[statKey]) rankings[statKey] = [];
        rankings[statKey].push({ name, value: data[name][statKey] });
        }
    }

    // Sort rankings and assign ranks
    for (let statKey in rankings) {
        rankings[statKey].sort((a, b) => b.value - a.value); // Descending order
        let rank = 1;
        for (let i = 0; i < rankings[statKey].length; i++) {
            if (i > 0 && rankings[statKey][i].value < rankings[statKey][i - 1].value) {
                rank = i + 1; // Update rank only if the value changes
            }
            rankings[statKey][i].rank = rank;
        }
    }


    // Apply tier-based styles based on the selected user's rank in each stat
    document.querySelectorAll('.singlecontainer').forEach(statDiv => {
        if (statDiv.id === "infoheader") {return};
        const statKey = statDiv.querySelector(".singlestats").id;
        const selectedStatValue = data[selectedName][statKey];

        if (!rankings.hasOwnProperty(statKey)) {
            return;
        };

        // Find selected user's entry in the ranking
        const statRanking = rankings[statKey];
        const selectedEntry = statRanking.find(entry => entry.name === selectedName);

        if (selectedEntry) {
            if (statKey.startsWith("team")) {
                statDiv.classList.add('style_prism');
                return;
            }
            const rank = selectedEntry.rank;
            statDiv.querySelector(".singlestats").querySelector("#rank").innerHTML = `(#${rank})`;
            if (rank === 1) {
                statDiv.classList.add('style_diamond');
            } else if (rank === 2) {
                statDiv.classList.add('style_platinum');
            } else if (rank === 3 || rank === 4) {
                statDiv.classList.add('style_gold');
            } else if (rank >= 5 && rank <= 7) {
                statDiv.classList.add('style_silver');
            } else if (rank >= 8 && rank <= 12) {
                statDiv.classList.add('style_bronze');
            } else {
                statDiv.classList.add('style_white');
            };
        } else {
            if (statKey.startsWith("team")) {
                return;
            }
            // Reset display (and keep gray)
            statDiv.querySelector(".singlestats").querySelector("#rank").innerHTML = '(#-)';
        }
    });
};

function unrankedSet() {
    document.querySelectorAll('.singlecontainer').forEach(div => {
        if (div.classList.contains("unranked")) {
            const existingImg = Array.from(div.children).find(child => child.tagName === 'IMG');
            if (existingImg) {
                existingImg.remove();
            }

            const urIcon = document.createElement("img");
            urIcon.src = "res/Fadeout.png";
            urIcon.classList.add("fadeout");
            urIcon.title = "No points for this award.";

            div.insertBefore(urIcon, div.firstChild);
            if (document.getElementById("hideUnranked").checked) {
                div.style.display = "none"
            } else {
                div.style.display = "grid"
            }
        };
    });
    dynWidth();
};

// Dynamically adjust width of .simplecontainer divs which are last in an odd number
function dynWidth() {
    document.querySelectorAll(".theme").forEach(container => {
        const visibleChildren = [...container.children].filter(child => {
            return getComputedStyle(child).display !== "none" && !(child.id === "infoheader")
        });

        // Reset
        visibleChildren.forEach(child => child.style.width = "");

        // Applying
        if (visibleChildren.length % 2 === 1) {
            visibleChildren[visibleChildren.length - 1].style.width = "calc(98% + 7px)";
        }
    });
};

// Debugging
/*
document.addEventListener("click", function(event) {
    console.log("Clicked element:", event.target);
    console.log("Element details:", {
        tagName: event.target.tagName,
        id: event.target.id,
        classList: [...event.target.classList]
    });
});
*/

