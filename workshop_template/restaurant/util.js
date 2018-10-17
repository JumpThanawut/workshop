function requestSnapLogic(url, token, params, success, failed) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var responseJson = JSON.parse(xhr.responseText);
      success(responseJson);
    } else if (xhr.status != 200) {
      swal({
        type: "error",
        title: "Oops...",
        text: "Something went wrong with your request!"
      });
      failed(xhr);
    }
  };
  var content = {
    token: token,
    params: params
  };
  xhr.send(JSON.stringify(content));
}

function requestSnapLogicTrigger(url, token, data, success, failed) {
  var xhr = new XMLHttpRequest();
  if (data != null && data.length == 0) {
    xhr.open("GET", url, true);
  } else {
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
  }
  xhr.setRequestHeader("Authorization", "Bearer " + token);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var responseJson = JSON.parse(xhr.responseText);
      success(responseJson);
    } else if (xhr.status != 200) {
      swal({
        type: "error",
        title: "Oops...",
        text: "Something went wrong with your request!"
      });
      failed();
    }
  };
  if (data.length == 0) {
    xhr.send();
  } else {
    xhr.send(JSON.stringify(data));
  }
}
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(
    m,
    key,
    value
  ) {
    vars[key] = value;
  });
  return vars;
}
