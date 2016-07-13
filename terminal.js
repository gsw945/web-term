var terminal = {

  baseUrl: "http://localhost:5000/",
  /* List of the current stack of dirs */
  dirStack: [""],
  /* The input dom element */
  stdin: document.getElementById("stdin"),
  /* The entire terminal element */
  element: document.getElementById("terminal"),
  /* The element currently reflecting the input */
  activeInputElement: document.getElementById("input-display-init"),
  /* The cursor element */
  cursor: "",

  setup: function() {
    stdin.addEventListener("keypress", terminal.handleKeyPress);
    stdin.addEventListener("input", terminal.handleInputChange);
    window.addEventListener("mouseup", terminal.handleMouseUp);
    var cursorElement = document.getElementById("terminal-cursor");
    terminal.cursor = new Cursor(cursorElement);
    terminal.resultsForExpression("", function(response) {
      result = JSON.parse(response);
      terminal.dirStack = result.dirstack;
      document.getElementById("stdin-1").innerHTML = terminal.prompt();
    });
  },

  httpGet: function(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
      if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
  },

  /**
   * Perform async GET request for the result of doing command at path.
   * @param {string} path - The current absolute path of the user in the file system.
   * @param {string} expression - The expression to be executed as a command
   */
  getWithPath: function(path, expression, callback) {
    fullUrl = terminal.baseUrl + "?path=" + path + "&expr=" + expression;
    terminal.httpGet(fullUrl, callback);
  },

  /**
   * combine dirStack into a path.
   */
  pathFromDirStack: function() {
    return terminal.dirStack.join("/");
  },

  /**
   * generate a prompt.
   */
  prompt: function() {
    return terminal.pathFromDirStack() + " $ ";
  },

  /**
   * @access public
   * Submit the current expression, and pass the output to callback.
   */
  resultsForExpression: function(expression, callback) {
    terminal.getWithPath(terminal.pathFromDirStack(), expression, callback);
  },

  /**
   * If the key pressed is the enter key, submit the contents of input.
   */
  handleKeyPress: function(event) {
    if (event.keyCode == 13) { // enter
      terminal.resultsForExpression(stdin.value, function(response) {
        result = JSON.parse(response);
        terminal.dirStack = result.dirstack;
        terminal.dom.addLine(result.evaluated);
      });
    }
  },

  /**
   * Update content of input display
   */
  handleInputChange: function(event) {
    terminal.dom.setInputDisplay(stdin.value);
  },

  /**
   * Focus on the input.
   */
  handleMouseUp: function(e) {
    terminal.stdin.focus();
  },

  /**
   * A subclass that handles dom element creation.
   */
  dom: {
    addLine: function(content) {
      stdin.value = "";
      var cursor = terminal.element.removeChild(terminal.cursor.element);

      lineBreak = document.createElement("br");
      terminal.element.appendChild(lineBreak);

      output = document.createElement("pre");
      output.innerHTML = content;
      terminal.element.appendChild(output);

      prompt = document.createElement("code");
      prompt.innerHTML = terminal.prompt();
      terminal.element.appendChild(prompt);

      activeDisplay = document.createElement("code");
      terminal.activeInputElement = activeDisplay;
      terminal.element.appendChild(activeDisplay);

      terminal.element.appendChild(cursor);
    },
    setInputDisplay: function(content) {
      terminal.activeInputElement.innerHTML = content;
    },
  },

}

var Cursor = function(element) {
  this.element = element;
  this.on = true;
  element.style.transition = "all 0.1s";
  var myself = this;
  // this.interval = setInterval(function() {
  //   myself.updateBlinkState();
  // }, 400);
}
Cursor.prototype.updateBlinkState = function() {
  if (this.on) {
    this.element.style.opacity = "0";
    this.on = false;
  } else {
    this.element.style.opacity = "1";
    this.on = true;
  }
}

terminal.setup();
