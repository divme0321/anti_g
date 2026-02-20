import { copyToClipboard, showToast } from '../main.js';

const WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
    'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
    'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
    'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
    'explicabo', 'nemo', 'ipsam', 'voluptas', 'aspernatur', 'aut', 'odit', 'fugit',
    'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
    'neque', 'porro', 'quisquam', 'nihil', 'molestiae', 'illum', 'corporis',
    'suscipit', 'laboriosam', 'harum', 'quidem', 'rerum', 'facilis', 'distinctio',
];

function randomWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }

function generateSentence(minWords = 6, maxWords = 14) {
    const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
    const words = Array.from({ length: count }, randomWord);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
}

function generateParagraph(sentences = 4) {
    return Array.from({ length: sentences }, () => generateSentence()).join(' ');
}

export function renderLoremIpsum() {
    const page = document.createElement('div');
    page.className = 'tool-page';
    page.innerHTML = `
    <div class="tool-header">
      <div class="tool-breadcrumb">
        <a href="#/">Home</a> <span>/</span> <span>Lorem Ipsum</span>
      </div>
      <h1>Lorem Ipsum Generator</h1>
      <p>Generate placeholder text for your designs and mockups.</p>
    </div>
    <div class="tool-container single-pane">
      <div class="tool-pane">
        <div class="pane-header">
          <span class="pane-title">Options</span>
        </div>
        <div class="pane-body">
          <div class="lorem-controls">
            <div class="form-group">
              <label>Count</label>
              <input type="number" id="lorem-count" value="3" min="1" max="50" />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select id="lorem-type">
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
              </select>
            </div>
            <div style="display:flex;align-items:flex-end;gap:0.5rem;">
              <button class="btn btn-primary" id="lorem-generate">Generate</button>
              <button class="btn btn-secondary" id="lorem-copy">📋 Copy</button>
            </div>
          </div>
          <div class="lorem-output" id="lorem-output" style="margin-top:1rem;"></div>
        </div>
      </div>
    </div>
  `;

    setTimeout(() => {
        const output = document.getElementById('lorem-output');

        function generate() {
            const count = Math.min(50, Math.max(1, +document.getElementById('lorem-count').value || 3));
            const type = document.getElementById('lorem-type').value;
            let result = '';

            if (type === 'paragraphs') {
                result = Array.from({ length: count }, () => `<p style="margin-bottom:1rem;">${generateParagraph()}</p>`).join('');
            } else if (type === 'sentences') {
                result = `<p>${Array.from({ length: count }, () => generateSentence()).join(' ')}</p>`;
            } else {
                result = `<p>${Array.from({ length: count }, randomWord).join(' ')}</p>`;
            }
            output.innerHTML = result;
        }

        document.getElementById('lorem-generate').addEventListener('click', generate);

        document.getElementById('lorem-copy').addEventListener('click', () => {
            if (output.textContent) copyToClipboard(output.textContent);
        });

        generate();
    }, 0);

    return page;
}
