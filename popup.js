// define angular module/app
var formApp = angular.module('codeCheckerApp', []);


	// create angular controller and pass in $scope and $http
function codeCheckController($scope, $http) {
	
	$scope.formData = {
		source: '#include<iostream> using namespace std; int main() { int n; cin>>n; cout<<n<<endl; }',
		lang: "2",
		testcases: '["1", "2", "3"]',
		api_key: "hackerrank|14807-52|abf8a82eebd8ce505b74ebb7316089edbc6fed96",
		wait: "true",
		format: "json"
	};
	
	$scope.available_languages = {"C": 1, "C++": 2, "Java": 3, "C#": 4, "PHP": 7, "Ruby": 8,"Python": 5,"Perl": 6,"Haskell": 12, "Clojure": 13, "Scala": 15, "CLISP": 17, "Lua": 18, "Erlang": 16, "Go": 21};
	
	$scope.available_languages_str = ["C", "C++", "Java", "C#", "PHP", "Ruby","Python","Perl","Haskell", "Clojure", "Scala", "Erlang", "Go"];
	
	$scope.language_mode = {
		"C": "ace/mode/c_cpp",
		"C++": "ace/mode/c_cpp",
		"Python": "ace/mode/python",
		"Java": "ace/mode/java",
		"C#": "ace/mode/csharp",
		"Ruby": "ace/mode/ruby",
		"PHP": "ace/mode/php",
		"Perl": "ace/mode/perl",
		"Haskell": "ace/mode/haskell",
		"Clojure": "ace/mode/clojure",
		"Scala": "ace/mode/scala",
		"Erlang": "ace/mode/erlang",
		"Go": "ace/mode/java",
	};
	
	$scope.source = getSource();
	$scope.testcases = [];
	$scope.language = getLanguage();
	$scope.format = "json";
	$scope.results=getResults();
	$scope.testcase = "";
	
	$scope.editor = ace.edit("editor");
	$scope.editor.setTheme("ace/theme/eclipse");
	$scope.editor.getSession().setMode("ace/mode/c_cpp");
	$scope.editor.session.setValue(getSource());
	
	function getResults() {
		if ('results' in localStorage) {
			return localStorage['results'];
		} else {
			return [];
		}
	}
	
	function getLanguage() {
		if ('preferred_language' in localStorage) {
			return localStorage['preferred_language'];
		} else {
			return "C++";
		}
	}
	
	function getSource() {
		if ('last_source' in localStorage) {
			return localStorage['last_source'];
		} else {
			return "";
		}
	}
	// listeners to save/restore document.body 
	window.addEventListener("unload", function(event) {
	   localStorage["preferred_language"]=$scope.language;
	   localStorage["last_source"]=$scope.getSource();
	});
	
	$scope.getSource = function() {
		return $scope.editor.getValue();
	}
	
	$scope.setLanguageMode = function() {
		lang = $scope.language;
		mode = "ace/mode/c_cpp";
		if (lang in $scope.language_mode) {
			mode = $scope.language_mode[lang];
		}
		$scope.editor.getSession().setMode(mode);
		return mode;
	}
	
	$scope.replaceAll = function(str, search, replace) {
	  while (str.indexOf(search) > -1) {
		str = str.replace(search, replace);
	  }
	  return str;
	}
	
	$scope.constructFormData = function() {
		var formData = {};
		formData['source'] = $scope.getSource();
		var testcase = "[";
		total = $scope.testcases.length;
		for (var i=0;i<total;i++) {
			if (i!=0) {
				testcase = testcase + ",";
			}
			testcase = testcase +  '"' + $scope.testcases[i] + '"';
		}
		if (total == 0 && $scope.results.length == 0) {
			testcase = testcase + '"sample test"';
			$scope.results.push({testcase: "Sample test", output: ""});
		} else if (total == 0) {
			testcase = testcase + '"sample test"';
			$scope.results[0].output = "";
		}
		testcase = testcase + "]";
		formData['testcases']=testcase;
		formData['lang'] = $scope.available_languages[$scope.language];
		formData['wait']='true';
		formData['api_key']="hackerrank|14807-52|abf8a82eebd8ce505b74ebb7316089edbc6fed96";
		formData['format']='json';
		console.log(formData);
		return formData;
	}

	$scope.addTestcase = function() {
		var test = "";
		var lines = $('#testcase').val().split('\n');
		for(var i = 0;i < lines.length;i++){
			if (i != 0) {
				test += " ";
			}
			test += lines[i];
		}
		//test = test.replace(/"/g, '\\"');
		$scope.testcases.push(test);
		result = {testcase: test, output: ""};
		$scope.results.push(result);
	}
	
	// process the form
	$scope.processForm = function() {
		$http({
        method  : 'POST',
        url     : 'http://api.hackerrank.com/checker/submission.json',
        data    : $.param($scope.constructFormData()),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
		}).success(function(data) {
            console.log(data);
            if (data.result) {
				
			}
        });
	};
	
	$scope.clearTests = function() {
		$scope.results = [];
		$scope.tests = [];
		$scope.testcases = [];
	}
	
	$scope.compileAndTest = function() {
		$scope.errorMessage = "";
		$http({
        method  : 'POST',
        url     : 'http://api.hackerrank.com/checker/submission.json',
        data    : $.param($scope.constructFormData()),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
		}).success(function(data) {
            console.log(data);
			if (!data.result) {
            	// if not successful, bind errors to error variables
                $scope.errorMessage = "Unexpected error, please check for the error in javascript console";
            } else {
				result = data.result;
				compile_message = data.result.compilemessage;
				if (compile_message == ""|| (data.result.message != "")) {
					messages = data.result.message;
					stdout = data.result.stdout;
					stderr = data.result.stderr;
					time = data.result.time;
					total = data.result.message.length;
					console.log("total: " +  total);
					for (var i=0;i<total;i++) {
						result = $scope.results[i];
						if (stdout[i] != "") {
							var op = stdout[i];
							op = $scope.replaceAll(op, "\r\n", "<br>");
							op = $scope.replaceAll(op, "\n", "<br>");
							op = $scope.replaceAll(op, "\r", "<br>");
							result['output'] = op;
						} else if (stderr[i] != "") {
							var op = stderr[i];
							op = $scope.replaceAll(op, "\r\n", "<br>");
							op = $scope.replaceAll(op, "\n", "<br>");
							op = $scope.replaceAll(op, "\r", "<br>");
							result['output'] = op;
						}
						result['success'] = messages[i];
						result['time'] = time[i];
						console.log(result);
						$scope.results[i]=result;
					}
				} else {
					$scope.errorMessage=compile_message;
				}
            }
        });
	};
	
}


function CodeCompileController($scope) {
	
	$scope.output = "hello";

	$scope.compileAndTest = function compileAndTest() {
		api_key = "hackerrank|14807-52|abf8a82eebd8ce505b74ebb7316089edbc6fed96";
		$.ajax({
			type: 'post',
			dataType: 'json',
			url: "http://api.hackerrank.com/checker/submission.json",
			data: {source: 'print "Hello,World"', lang: '5', testcases: '["sridhar"]', api_key: api_key, wait: "true", format: "json"	},
			success: function(data) {
				$scope.output = "hello2";
			},
			error: function(x, status, error) {
				$scope.output = "hello1";
			}
		});
	}
}