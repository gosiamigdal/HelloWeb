var page = require('webpage').create();

function waitFor(condition, onSuccess, timeOutMs, intervalMs) {
  var cutoffTime = new Date().getTime() + (timeOutMs || 3000),
      interval = setInterval(function () {
        if (new Date().getTime() > cutoffTime) {
          console.log('FAIL:')
          console.log('- "waitFor" timeout');
          phantom.exit();
        }

        if (condition()) {
          clearInterval(interval);
          onSuccess();
        }

      }, intervalMs || 100);
}

page.open('https://www.yahoo.com', function () {
  page.evaluate(function () {
    document.querySelector('input').value = 'Hello Web';
    document.querySelector('#search-submit').click();
  });
  console.log('Waiting for new page');
  waitFor(function () {
    return page.evaluate(function () {
      return document.querySelectorAll('.res').length > 1;
    });
  }, function () {
    var pageUrl = page.evaluate(function () {
      return window.location.origin;
    });
    var expectedUrl = 'https://search.yahoo.com';
    var addressBarOk = expectedUrl === pageUrl;

    var linksCount = page.evaluate(function () {
      var reYahoo = new RegExp('.*yahoo\\.com/.*');
      var links = document.querySelectorAll('a');
      var linksCount = 0;
      for (var i = 0; i < links.length; i++) {
        if (!reYahoo.test(links[i].href)) {
          linksCount += 1;
        }
      }
      return linksCount;
    });

    var linksOk = linksCount >= 5;

    console.log('Taking screenshoot "page.png"');
    page.render('page.png');

    if (addressBarOk && linksOk) {
      console.log('PASS');
    } else {
      console.log('FAIL:');
      if (!addressBarOk) {
        console.log('- expected url "%s", got "%s"', expectedUrl, pageUrl);
      }
      if (!linksCount) {
        console.log(' - not enough external links, got "%d"', linksCount);
      }
    }
    phantom.exit();
  });
});



