const containerMass = 5;
const mouseMass = 10;

let imageHasLoaded = false;

let mouseX = 0;
let prevMouseX = 0;
let mouseXOnDown = null;
let isMouseDown = false;

let containerPosition = 0;
let mouseVelocity = 0;
let containerVelocity = 0;

let imagesElement = null;

const checkImagesHasLoaded = (images) => {
  const allImagePromises = images.map((image) => {
    return new Promise((resolve) => {
      const imageObj = new Image();
      imageObj.onload = () => {
        resolve(imageObj);
      };

      imageObj.src = image;
    });
  });

  return Promise.all(allImagePromises);
};

const createBeltScroller = (container, images) => {
  checkImagesHasLoaded(images).then((resolvedImages) => {
    imageHasLoaded = true;
    const beltDOMItems = images.map((image, index) => {
      const element = document.createElement('div');
      element.classList.add('article-img-block');

      const elementImgDiv = document.createElement('div');
      elementImgDiv.classList.add('article-img');

      const elementLink = document.createElement('a');
      elementLink.href = image;

      const elementImage = document.createElement('img');
      elementImage.src = image;
      elementImage.alt = `Earth in Blender step ${image}`;

      elementLink.appendChild(elementImage);
      elementImgDiv.appendChild(elementLink);
      element.appendChild(elementImgDiv);
      return element;
    });

    imagesElement = beltDOMItems.map((element) => element);

    beltDOMItems.forEach((beltDOMItem) => {
      container.appendChild(beltDOMItem);
    });
  });
};

const container = document.querySelector('#container');

createBeltScroller(container, [
  'data/p1.png',
  'data/p2.png',
  'data/p3.png',
  'data/p4.png',
  'data/p5.png',
  'data/p6.png',
  'data/p7.png',
  'data/p8.png',
  'data/p9.png',
  'data/p10.png',
  'data/p11.png',
  'data/p12.png',
  'data/p13.png',
]);
