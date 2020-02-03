function getSlideTitleFromContent(slide) {
  var title = null;

  // Slide content is an array of content data,
  slide.content.forEach(contentBlock => {
    var isStringContent =
      typeof contentBlock === "string" || contentBlock instanceof String;
    if (!isStringContent) return;

    // Split stringcontent and check each line individually
    var lines = contentBlock.split("\n");

    if (lines && lines.length > 0) {
      lines.forEach(line => {
        line = line.trim();
        var isTitle = line.indexOf("# ") == 0;
        if (!title && isTitle) {
          title = line.substring(2);
        }
      });
    }
  });

  return title;
}

function getSlideTitle(slide) {
  var title = null;

  // First try get by name if defined
  if (slide.properties.name) {
    return slide.properties.name;
  }

  // Try get title by searching slide content
  return getSlideTitleFromContent(slide);
}

function getSlideHtml(slide) {
  var index = slide.getSlideIndex();
  var slideTitle = getSlideTitle(slide);
  if (!slideTitle) {
    console.error(
      `Cannot render HTML for slide ${index}, H1 or Name is required on each slide`,
      slide
    );
  }

  var isSection = slide.properties.template == "section";
  var linkText = isSection
    ? `<h3>${index + 1}. ${slideTitle}</h3>`
    : `<span class="small">${index + 1}. ${slideTitle}</span><br />`;

  var isCurrentSlide = index == slideshow.getCurrentSlideIndex();
  var html = `<a href="#${index + 1}" id="slide-link-${index}" class="${
    isCurrentSlide ? "outline-active-slide-link" : ""
  }">${linkText}</a>`;
  return html;
}

slideshow.on("showSlide", function(slide) {
  // Remove previous highlight
  $("#document-outline a").attr("class", "");

  // Highlight the current slide in index
  var index = slide.getSlideIndex();
  $("#slide-link-" + index).attr("class", "outline-active-slide-link");
});

$(document).ready(function() {
  $(".remark-slide-container .remark-slide-content").each(function(index) {
    // Add the link to open outline modal on each slide
    $(this).append(
      `
        <div class="slideshow-outline-link">
            <a href="#document-outline" rel="modal:open"><img src="images/index-icon.png" width="13px" /></a>
        </div>`
    );
  });

  var outline = "<h1>Contents</h1>";
  var slides = slideshow.getSlides();
  for (var i = 0; i < slides.length; i++) {
    var slide = slides[i];

    if (slide.properties.continued == "true") {
      continue;
    }

    outline += getSlideHtml(slide);
  }

  $("#document-outline").prepend(outline);
});