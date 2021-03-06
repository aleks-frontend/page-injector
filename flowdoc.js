function flowDoc({ 
    headerHeight=100, 
    footerHeight=100, 
    bodyPaddingTop=20, 
    bodyPaddingBottom=20 
  } = {}) {
    const dynamicPagesContainer = document.querySelector('.flowDoc-container');
    const fragment = document.createDocumentFragment();
    const tempTarget = document.querySelector('.flowDoc-target');
    const bleedHeight = getBleedHeightInPx();
    let targetSlots = []; 
    let wordObjArray = [];
    let activeContainer = '';
    const maxHeight = window.innerHeight - headerHeight - footerHeight - bodyPaddingTop - bodyPaddingBottom - bleedHeight;
  
    // Getting the original html code of the source master element
    // together with <token> tags
    let wordsHTML = document.querySelector('.flowDoc-master').innerHTML;
  
    // Replace the rich text html elements with strings,
    // so we can keep them when using innerText to remove all the <token> tags
    let strippedWordsHTML = wordsHTML
    .replace(/<h1>/gi, ' [h1] ')
    .replace(/<\/h1>/gi, ' [/h1] ')
    .replace(/<p>/gi, ' [p] ')
    .replace(/<\/p>/gi, ' [/p] ');    
  
    // Creating a temporary placeholder div that we will use just to inject our custom
    // HTML string and use innerText on it to keep only our custom rich text tags and remove <token> tags
    const tempConverterDiv = document.createElement('div');
    tempConverterDiv.innerHTML = strippedWordsHTML;
    strippedWordsHTML = tempConverterDiv.innerText;        
  
    // Breaking the formated HTML string into an array or words and custom tags
    const formatedWordsArray = strippedWordsHTML.split(' ');
  
    // Looping the formatedWordsArray to build a wordObjArray which will be an array of objects
    // Objects will hold all the information required for each item in the formatedWordsArray        
    for ( const word of formatedWordsArray ) {
      const wordObj = {
        characters: '',
        tagInfo: {
          isTag: false,
          type: ''
        }
      };
  
      // Updating tagInfo properties in case of the custom tag
      switch(word) {
        case '[h1]':
          wordObj.tagInfo.isTag = true;
          wordObj.tagInfo.type = 'h1Open';
          break;
        case '[/h1]':
          wordObj.tagInfo.isTag = true;
          wordObj.tagInfo.type = 'h1Close';
          break;
        case '[p]':
          wordObj.tagInfo.isTag = true;
          wordObj.tagInfo.type = 'pOpen';
          break;
        case '[/p]':
          wordObj.tagInfo.isTag = true;
          wordObj.tagInfo.type = 'pClose';
          break;
        default:
          wordObj.tagInfo.isTag = false;
          wordObj.tagInfo.type = '';
      }
  
      // characters property should be se for each word item
      wordObj.characters = word;
  
      // In the end we push the newly created object to the wordObjArray[]
      wordObjArray.push(wordObj);
    }                        
  
    tempTarget.classList.remove('u-hide');
    clearDiv(tempTarget);
  
    // Looping the wordObjArray[] to create and fill targetSlots[] array
    // targetSlots[] array will be used to group word objects by page
    for ( const wordObj of wordObjArray ) {
      let formated = '';
  
      if ( wordObj.tagInfo.isTag ) {
        switch(wordObj.tagInfo.type) {
          case 'h1Open':
            const heading1 = document.createElement('h1');
            tempTarget.appendChild(heading1);
            activeContainer = heading1;
            break;
          case 'pOpen':
            const paragraph = document.createElement('p');
            tempTarget.appendChild(paragraph);
            activeContainer = paragraph;
            break;
        }
      } else {
        formated = wordObj.characters + ' ';
      }          
  
      if ( tempTarget.offsetHeight < maxHeight ) {
        activeContainer.innerHTML += formated;
      } else {
        const overlappingActiveContainer = activeContainer;
        activeContainer.remove();
        targetSlots.push(tempTarget.innerHTML);
        clearDiv(tempTarget);
        tempTarget.appendChild(overlappingActiveContainer);
      }
  
    }
  
    targetSlots.push(tempTarget.innerHTML);
    tempTarget.classList.add('u-hide');        
  
    clearDiv(dynamicPagesContainer);
  
    // Looping the targetSlots[] array to generate pages and inject the content
    for ( const slot of targetSlots ) {
      const page = document.createElement('div');
      page.classList.add('page');
      page.style.cssText = `
  overflow: hidden;
  position: relative;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;          
  `;         
  
      const bleed = document.createElement('div');
      bleed.classList.add('bleed');
      bleed.style.cssText = `
  position: absolute;
  top: 4.41mm;
  right: 4.41mm;
  bottom: 4.41mm;
  left: 4.41mm;
  `;
      page.appendChild(bleed);
  
      const fit = document.createElement('div');
      fit.classList.add('fit', 'container', 'u-flex-column');
      bleed.appendChild(fit);
  
      const header = document.createElement('div');
      header.classList.add('header');
      header.style.cssText = `
  flex-basis: ${headerHeight}px; 
  flex-shrink: 0;
  background: tomato;
  display: flex;
  align-items: center;
  justify-content: center;
  `;
      header.innerHTML = 'Header';
  
      const footer = document.createElement('div');
      footer.classList.add('footer');
      footer.style.cssText = `
  flex-basis: ${footerHeight}px; 
  flex-shrink: 0;
  background: wheat;
  display: flex;
  align-items: center;
  justify-content: center;
  `;
      footer.innerHTML = 'Footer';
  
      const body = document.createElement('div');
      body.classList.add('body');
      body.style.cssText = `
  flex: 1;
  padding-top: ${bodyPaddingTop}px;
  padding-bottom: ${bodyPaddingBottom}px;
  `;
  
      fit.appendChild(header);
      fit.appendChild(body);
      fit.appendChild(footer);
  
      body.innerHTML = slot;
  
      addCropMarks(page);
  
      fragment.appendChild(page);
    }
  
    dynamicPagesContainer.appendChild(fragment);
  }
  
  // Helper function for clearing div's html
  function clearDiv(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  // Helper function for getting the bleed dimensions in px
  function getBleedHeightInPx() {
    // Creating temporary div with height set in mm and appending it to body
    const tempBleedDiv = document.createElement('div');
    tempBleedDiv.style.height = '8.82mm';
    document.body.appendChild(tempBleedDiv);
  
    // Getting new element's height in px and putting it in a variable
    const bleedHeightInPx = tempBleedDiv.offsetHeight;
  
    // Removing temporary div from the div as we no longer need it
    tempBleedDiv.remove();
  
    // Returning the value in px
    return bleedHeightInPx;
  }
  
  // Helper function for adding crop-marks to newly created pages
  function addCropMarks(page) {
    if ( !window.showCrop ) return;
  
    const cropImage = 'https://outfit-v2-exports-production.s3-accelerate.amazonaws.com/media_library_items/bdb964a7c7fdc5ebc8bbde9204b62464/crop.svg';
    const cropMarks = document.createElement('div');
    cropMarks.classList.add('crop-marks');
    cropMarks.innerHTML = `
  <img style="height: 28.81px; width: 28.81px; position: absolute; top: 0; left: 0;" src="${cropImage}">
  <img style="height: 28.81px; width: 28.81px; transform: rotate(90deg); position: absolute; top: 0; right: 0;" src="${cropImage}">
  <img style="height: 28.81px; width: 28.81px; transform: rotate(180deg); position: absolute; bottom: 0; right: 0;" src="${cropImage}">
  <img style="height: 28.81px; width: 28.81px; transform: rotate(270deg); position: absolute; bottom: 0; left: 0;" src="${cropImage}">
  `;
  
    page.appendChild(cropMarks);
  }
  
  // Initializing the function and setting up Mutation Observer
  flowDoc();
  
  // 'debounce' simulation
  let flowDocObserverTimeout;
  const flowDocObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      // Logic for preventing the pageInjector() function from being called 
      // each time the key is pressed on the keyboard (simulation of 'debounce')
      clearTimeout(flowDocObserverTimeout);
  
      flowDocObserverTimeout = setTimeout(() => {
        flowDoc();
      }, 1500);
    });
  });
  
  const flowDocMaster = document.querySelector('.flowDoc-master');
  flowDocObserver.observe(pageInjectorMaster, {
    attributes: false,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: false,
    characterDataOldValue: true
  });
  