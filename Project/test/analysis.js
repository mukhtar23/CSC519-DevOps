var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var fs = require("fs");
var glob = require("glob")

function main()
{
	var args = process.argv.slice(2);	
	var directoryPath = args[0];

	var getDirectories = function (src, callback) {
		glob(src + '/**/*.js', callback);
	  };
	  getDirectories(directoryPath, function (err, res) {
		if (err) {
		  console.log('Error', err);
		} else {
		  res.forEach(function(filePath){
		  complexity(filePath);
		  });
		  
		}
		// Report
		console.log('\n\n---------------------------------\n' +
					'Begin Report\n---------------------------------\n' +
					`Number of files considered : ${Object.keys(builders).length}\n`);
		for( var node in builders )
		{
			var builder = builders[node];
			builder.report();
		}

		process.exit(buildStatus());
	  });
}

function buildStatus(){
	for( var node in builders ){
		var builder = builders[node];
		if( builder.LongMethods >= 1 || builder.LongestChain > 10 || builder.MaxNest > 5){
			return 1; // build failure
		}
	}
	return 0; // build successful
};

var builders = {};

// Represent a reusable "class" following the Builder pattern.
function FunctionBuilder()
{
	this.StartLine = 0;
	this.Length = 0;
	this.FunctionName = "";
	// The number of parameters for functions
	this.ParameterCount  = 0,
	// Number of if statements/loops + 1
	this.SimpleCyclomaticComplexity = 0;
	// The max depth of scopes (nested ifs, loops, etc)
	this.MaxNestingDepth    = 0;
	// The max number of conditions if one decision statement.
	this.MaxConditions      = 0;

	this.report = function()
	{
		console.log(
		   (
		   	"{0}(): {1}\n" +
		   	"============\n" +
			   "Length: {2}\n\n"
			)
			.format(this.FunctionName, this.StartLine,
				     this.Length)
		);
	}
};

// A builder for storing file level information.
function FileBuilder()
{
	this.FileName = "";
	// Number of strings in a file.
	this.LongMethods = 0;
	this.Methods = 0;
	this.Chains = 0;
	this.LongestChain = 0;
	this.MaxNest = 0;

	this.report = function()
	{
		console.log (
			( "File Name    {0}\n" +
			  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n"+
			  "Number of Long Methods {1}    |    Longest Chain {2}    |    Maximum [IF]Nest {3}\n"
			).format( this.FileName, this.LongMethods, this.LongestChain, this.MaxNest ));
		if (this.Methods == 0){console.log('')}
	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

function complexity(filePath)
{
	console.log(`Measuring COMPLEXITY of: ${filePath}`);
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	// A file level-builder:
	var fileBuilder = new FileBuilder();
	fileBuilder.FileName = filePath;
	builders[filePath] = fileBuilder;
	
	chainLength = 0;
	nestDepth = 0;

	// Tranverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		// Determine length of function
		if (node.type === 'FunctionDeclaration') 
		{
			var builder = new FunctionBuilder();

			builder.FunctionName = functionName(node);
			builder.Length    	 = node.loc.end.line - node.loc.start.line;
		
			builders[builder.FunctionName] = builder;
			if (builders[builder.FunctionName].Length > 100){
				fileBuilder.LongMethods += 1;
			}
		}

		// Determine long chain length
		if (node.type === 'MemberExpression') 
		{
			chainLength += 1;
		} else {
			if (chainLength > builders[filePath].LongestChain){
				builders[filePath].LongestChain = chainLength;
			} 
			chainLength = 0;
		}
		// Determine maxnestingdepth (if statements)
		if (node.type === 'IfStatement'){
			if ( node.consequent.body == null){
				if (nestDepth > builders[filePath].MaxNest){
					builders[filePath].MaxNest = nestDepth;
				}
				nestDepth = 0;
			} else {
				nestDepth += 1;
			}	
		}
	});

}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

// Helper function for allowing parameterized formatting of strings.
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
exports.main = main;

