let imgNames = [];
const imgDiv = document.querySelector('.mps-container');
const div = document.createElement('div');
div.className = 'article-img-flex';
imgDiv.appendChild(div);

console.log(imgDiv);
// Get the data
d3.json('../data/categories.json').then(function (data) {
  console.log(data);

  data.forEach((elem, i) => {
    if (elem.parent) {
      const div1 = document.createElement('div');
      div1.className = 'article-img-block sm';

      const div2 = document.createElement('div');
      div2.className = 'article-img';

      const a = document.createElement('a');
      a.href = `./${elem.name}/`;
      const img = document.createElement('img');
      img.src = `./data/${elem.name}.png`;
      img.title = elem.name;
      img.alt = elem.name;
      a.appendChild(img);
      div2.appendChild(a);

      const div3 = document.createElement('div');
      div3.className = 'article-img-desc';
      div3.innerText = elem.description;
      div2.appendChild(div3);

      div1.appendChild(div2);
      div.appendChild(div1);
    }
  });
});
