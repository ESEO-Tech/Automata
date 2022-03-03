
async function updateMenu() {
    // Load list of game sections.
    const resp  = await fetch("games/index.json");
    const sectionIds = await resp.json();

    let html = "";

    for (const sid of sectionIds) {
        // Load game section metadata.
        const resp    = await fetch(`games/${sid}/index.json`);
        const section = await resp.json();

        // Add section title and open game list.
        html += `<h1>${section.title}</h1><ul>`;

        for (const gid of section.contents) {
            // Load game metadata.
            const resp = await fetch(`games/${sid}/${gid}/index.json`);
            const game = await resp.json();

            // Add list item with game icon and title.
            html += `<li>
                <a href="game.html#${sid}.${gid}">
                    <img src="games/${sid}/${gid}/icon.svg">
                    ${game.title}
                </a>
            </li>`
        }

        // Close game list for this section.
        html += '</ul>';
    }

    document.querySelector("#games-menu").innerHTML = html;
}

window.addEventListener("load", updateMenu);
