const el = document.createElement('nav');
el.innerHTML = `<label for="toggle-nav">Show Nav</label>
                <input id="toggle-nav" type="checkbox">
                <ul>
                    <li><a href="http://127.0.0.1:5500/screens/dashboard/dashboard.html">Dashboard</a></li>
                    <li><a href="http://127.0.0.1:5500/screens/components/board/Board.html">Board</a></li>
                    <li><a href="http://127.0.0.1:5500/screens/components/board/dev/Board_dev.html">Board_dev</a></li>
                    <li><a href="http://127.0.0.1:5500/screens/components/registration/dev/registrationModal_dev.html">RegistrationModal_dev</a></li>
                    <li><a href="http://127.0.0.1:5500/screens/narrative/narrative.html">Narrative</a></li>
                    <li><a href="http://127.0.0.1:5500/index.html">Nebula Escape (index)</a></li>
                </ul>`
export function nav() {document.body.appendChild(el)};