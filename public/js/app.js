export default class TagBrowserWidget {
  constructor(config) {
    this.config = config;

	 this.fetchData()
		 //use .bind because native promises change the "this" context
		 .then(this.setData.bind(this))
		 .then(this.getElements.bind(this))
		 .then(this.bindEventListeners.bind(this))
		 .then(this.clearAll.bind(this))
		 ;
    console.log('Widget Instance Created');
  }

  fetchData() {
	  return new Promise((resolve, reject) => {
		  $.get('/js/data.json', resolve);
	  });
  }

  setData(data) {
    this.data = data;
	 console.log('1 setData', this.data);
  }

  getElements() {
		this.mTags = new Map();			// Tags w Array of TitleIDs
		this.mTitles = new Map();		// Title obj w ID as key

	   // build maps
		let arTags = [];
		for (let thisTitle of this.data) {
			this.mTitles.set(thisTitle.id, thisTitle); // save title by id
			for (let tag of thisTitle.tags) {
				if (!this.mTags.has(tag)) {
					arTags.push(tag);
					this.mTags.set(tag, []);	// save new tag
				}
				this.mTags.get(tag).push(thisTitle.id);	// associate title to tag by id
			}
		}
		arTags.sort();	// sort the tags
		let arHtml = [];
		const liTemplate = '<li title="{#} Series"><span class="tag is-link">{tag}</span></li>';
		for (let tag of arTags) {
			arHtml.push(liTemplate.replace("{#}", this.mTags.get(tag).length).replace("{tag}", tag));
		}
		$('.tag-list').html(arHtml.join(" "));		// Set tag-list


		console.log('2 getElements executed', this.mTags);
  }
// 3
  bindEventListeners() {
	  this.config.element.querySelectorAll('.tag-list')[0]
			.addEventListener('click', this.tagListClicked.bind(this));

	  this.config.element.querySelector('.clear-button')
		  .addEventListener('click', this.clearAll.bind(this));
	  console.log('3 bindEventListeners executed');
  }

  tagListClicked(event) {
	  this.config.element.querySelector('.clear-button').style.visibility = 'visible'; // show clear-button
	  let tag = event.target.innerText;
	  $("#selectedTag").html('"' + tag + '"');	// set Selected Tag

	  // Gen ul "matching-items-list"
	  let ul = this.config.element.querySelectorAll('.matching-items-list')[0];
	  $('.matching-items-list').empty();
	  // add each li Title
	  for (let titleID of this.mTags.get(tag)) {
		  let li = document.createElement("li");
		  li.appendChild(document.createTextNode(this.mTitles.get(titleID).title));
		  li.setAttribute("data-titleID", titleID); 
		  ul.appendChild(li);
	  }

	  ul.addEventListener('click', this.titleClicked.bind(this)); // Set title clicks

	  $(".tag-list").find('.active').removeClass('active');	// Remove last active tag
	  event.target.classList.add('active');						// Hilight active tag
  }

  titleClicked(event) {
	  let titleID = parseInt(event.target.attributes[0].value);	// Get titleID from event
	  let mTitle = this.mTitles.get(titleID);							// Get title object

	  $("#selectedSeriesTitle").html(mTitle.title);

	  $("#description").html(mTitle.description);

	  $("#thumbnail").attr("src", mTitle.thumbnail);

	  $("#rating").html(mTitle.rating);
	  $("#nativeLanguageTitle").html(mTitle.nativeLanguageTitle);
	  $("#sourceCountry").html(mTitle.sourceCountry);
	  $("#type").html(mTitle.type);
	  $("#episodes").html(mTitle.episodes);

	  $(".matching-items-list").find('.active').removeClass('active');	// Remove last active title
	  event.target.classList.add('active');										// Hilight active title
  }

  clearAll() {
	  this.config.element.querySelector('.clear-button').style.visibility = 'hidden'; // Hide Clear button
	  $(".tag-list").find('.active').removeClass('active');	// Remove last active tag

	  $('.matching-items-list').empty();
	  $("#selectedTag").html("No Tag Selected");
	  $("#selectedSeriesTitle").html("No Series Selected");

	  $("#description").html("");
	  $("#thumbnail").attr("src", "http://via.placeholder.com/350x350");

	  $("#rating").html("");
	  $("#nativeLanguageTitle").html("");
	  $("#sourceCountry").html("");
	  $("#type").html("");
	  $("#episodes").html("");
  }
}
//export default class