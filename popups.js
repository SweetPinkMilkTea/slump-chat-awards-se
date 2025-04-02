let currentPage = 1
const totalStartPopupPages = 4

document.addEventListener('DOMContentLoaded', async () => {
    
    starterPopupLogic();

    // Click listeners to open standard pop-ups with
    document.querySelectorAll('.singlecontainer').forEach(statDiv => {
        if (statDiv.id === "infoheader") {
            statDiv.addEventListener('click', (event) => {
                const popup = document.getElementById('InfoPopup');
                const popupOverlay = document.getElementById('popupOverlay');
                
                document.getElementsByClassName("infoPopupContent")[0].classList.add("active");

                // Display the pop-up
                popupOverlay.style.display = 'block';
                popup.style.display = 'block';
                document.body.style.overflow = "hidden";
                requestAnimationFrame(() => {
                    popupOverlay.style.opacity = '1';
                    popup.style.opacity = '1';
                    popup.style.transform = 'translate(-50%, -50%) scale(1)';
                });
              });
            return;
        }
        statDiv.addEventListener('click', (event) => {
          const statKey = statDiv.querySelector(".singlestats").id;
          const title = statDiv.querySelector(".singletitle").innerHTML;
          const description = statDiv.querySelector(".singledescription").innerHTML;
          const icon = statDiv.querySelector(".singleicon").innerHTML;
          const flavor = flavor_text_map[title];
          const annotation = annotations[title];
          // Generate pop-up content
          createPopup(statKey, title, description, icon, flavor, annotation);
        });
    });

    // Close pop-up logic
    document.getElementById('popupClose').addEventListener('click', () => {
        const popup = document.getElementById('popup');
        const popupOverlay = document.getElementById('popupOverlay');

        // Exit animations
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
        popupOverlay.style.opacity = '0';

        // Waiting for animation to complete before hiding
        setTimeout(() => {
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
        }, 300);
        
        document.body.style.overflow = "initial";
    });

    // Close pop-up logic (for info-popup)
    document.getElementById('infoPopupClose').addEventListener('click', () => {
        const popup = document.getElementById('InfoPopup');
        const popupOverlay = document.getElementById('popupOverlay');

        // Add exit animations
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
        popupOverlay.style.opacity = '0';

        // Wait for animation to complete before hiding
        setTimeout(() => {
            popup.style.display = 'none';
            popupOverlay.style.display = 'none';
        }, 300);
        
        document.body.style.overflow = "initial";
    });
    
    // Paginate StartingPopup
    document.querySelectorAll('.navbutton').forEach(button => {
        button.addEventListener('click', (event) => {
        changeSPUPage(button.id)
    });});

    // Close popups when overlay is clicked
    document.getElementById("popupOverlay").addEventListener('click', () => {
        try {
            if (Array.from(document.getElementById("StartingPopup").classList).includes("active")) { return; }
        } catch {} finally {
            document.getElementById("popupClose").click();
            document.getElementById("infoPopupClose").click();
        };
    });

    // Delete key for preventing multiple interactions with StartingPopup
    document.getElementById("ResetSP").addEventListener('click', () => {
        localStorage.removeItem("popupShown");
    });
});

function starterPopupLogic() {
    document.querySelector(".navbar").innerHTML = "";
    for (let i = 0; i < totalStartPopupPages; i++) {
        const elementNode = document.createElement("img");
        if (i === currentPage - 1) {
            elementNode.src = "res/nav1.png";
        } else {
            elementNode.src = "res/nav0.png";
        };
        document.querySelector(".navbar").appendChild(elementNode);
    }
    // Show Starter Popup
    if (!localStorage.getItem("popupShown")) {
        document.getElementById("StartingPopup").classList.add("active");
        document.getElementById("StartingPopup").classList.add("popup");
        document.getElementById("popupOverlay").classList.add("active");
        const popup = document.getElementById('StartingPopup');
        const popupOverlay = document.getElementById('popupOverlay');
        popupOverlay.style.display = 'block';
        popup.style.display = 'block';
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => {
            popupOverlay.style.opacity = '1';
            popup.style.opacity = '1';
            popup.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    } else {
        document.getElementById("StartingPopup").remove()
    };
}

// Function to create and display the pop-up
function createPopup(statKey, title, description, icon, flavor, annotation) {
    const popup = document.getElementById('popup');
    const popupIcon = document.querySelector('.phIcon');
    const popupTitle = document.getElementById('popupHeader').querySelector('.phTitle');
    const popupDesc = document.getElementById('popupHeader').querySelector('.phDescription');
    const popupAnnotations = document.getElementById('popupAnnotation');
    const popupAnnotationsSub = popupAnnotations.querySelector("div");
    const popupContent = document.getElementById('popupContent');
    const popupOverlay = document.getElementById('popupOverlay');
    const popupFl = document.querySelector('.phFlavor');
    
    // Set header
    popupIcon.innerHTML = icon;
    popupTitle.innerHTML = title;
    popupDesc.innerHTML = description;
    popupFl.innerHTML = flavor;

    // Set Annotation, if available
    if (annotation === undefined) {
        popupAnnotations.style.display = "none";
    } else {
        popupAnnotations.style.display = "flex";
        popupAnnotationsSub.innerHTML = annotation
    };

    // Clear previous content
    popupContent.innerHTML = '';

    // Gather and sort data
    const sortedData = Object.entries(data)
    .map(([name, stats]) => ({ name, value: stats[statKey] || 0 }))
    .sort((a, b) => b.value - a.value);

    // Populate rows
    sortedData.forEach((entry, index) => {
        if (entry.value != 0) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.justifyContent = 'space-between';
            row.style.padding = '5px 0';
        
            // Create rank, name, and value elements
            const rank = document.createElement('span');
            rank.textContent = `${index + 1}`;
            rank.style.flex = '0 0 50px';
            rank.style.paddingTop = '3px';
            rank.className = 'rankIndicator';
        
            const name = document.createElement('span');
            name.textContent = entry.name;
            name.style.flex = '1 1 auto';
            name.style.verticalAlign = 'middle';
            name.style.paddingBottom = '3px';
        
            const value = document.createElement('span');
            value.textContent = entry.value;
            value.style.flex = '0 0 50px';
            value.style.textAlign = 'right';
            value.style.paddingBottom = '3px';
        
            // Add elements to the row
            row.appendChild(rank);
            row.appendChild(name);
            row.appendChild(value);
        
            // Append row to the pop-up content
            popupContent.appendChild(row);
        };
    });
    
    // Append end notice
    const row = document.createElement('div');
    row.className = "popupFinalRow";
    row.style.display = "flex";
    row.style.flexDirection = "column";
    if (popupContent.hasChildNodes()) {
        row.innerHTML = "<span>...and that's it!<span>";
    } else {
        row.innerHTML = "<img src='res/Z-Talisman.png'><span>You are not supposed to be here.<span>";
    }
    popupContent.appendChild(row);

    // Display the pop-up
    popupOverlay.style.display = 'block';
    popup.style.display = 'block';
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
        popupOverlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, -50%) scale(1)';
    });
};

function changeSPUPage(direction) {
    document.getElementById(`page-${currentPage}`).classList.remove("active");
    if (direction === "next") {
        if (currentPage === totalStartPopupPages) {
            localStorage.setItem("popupShown", "true");
            // Add exit animations
            document.getElementById("StartingPopup").style.opacity = '0';
            document.getElementById("StartingPopup").style.transform = 'translate(-50%, -50%) scale(0.8)';
            popupOverlay.style.opacity = '0';
        
            // Wait for animation to complete before hiding
            setTimeout(() => {
                document.getElementById("StartingPopup").style.display = 'none';
                popupOverlay.style.display = 'none';
                document.body.style.overflow = "initial";
                document.getElementById("StartingPopup").classList.remove("popup")
                document.getElementById("StartingPopup").classList.remove("active")
            }, 300);
            
        }
        currentPage = currentPage < totalStartPopupPages ? currentPage + 1 : totalStartPopupPages;
    } else if (direction === "prev") {
        currentPage = currentPage > 1 ? currentPage - 1 : 1;
    }
    document.getElementById(`page-${currentPage}`).classList.add("active");
    if (currentPage === 1) {
        document.querySelector("#prev").style.color = "gray";
        document.querySelector("#prev").classList.add("strikethrough")
    } else {
        document.querySelector("#prev").style.color = "white";
        document.querySelector("#prev").classList.remove("strikethrough")
    }
    if (currentPage === totalStartPopupPages) {
        document.querySelector("#next").textContent = "Start";
    } else {
        document.querySelector("#next").textContent = "Next";
    }
    document.querySelector(".navbar").innerHTML = "";
    for (let i = 0; i < totalStartPopupPages; i++) {
        const elementNode = document.createElement("img");
        if (i === currentPage - 1) {
            elementNode.src = "res/nav1.png";
        } else {
            elementNode.src = "res/nav0.png";
        };
        document.querySelector(".navbar").appendChild(elementNode);
    }
};