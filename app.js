require("dotenv").config()
const app = require("express")()
const port = process.env.PORT || 5001
const bodyParser = require("body-parser")
const NodeHTTPError = require("node-http-error")
const { pathOr, propOr, isEmpty, compose, not, join } = require("ramda")
const reqFieldChecker = require("./lib/required-field-check")
const {
	addBoard,
	getBoard,
	listBoards,
	updateBoard,
	deleteBoard
} = require("./dal")

app.use(bodyParser.json())

app.get("/", function(req, res, next) {
	res.send("Welcome to the brocean, brah.  Gnar Gnar.")
})

app.get("/boards/:sku", function(req, res, next) {
	const boardSku = `board_${req.params.sku}`
	console.log(boardSku)
	//getBoard(boardSku, x)
	//db.get(boardSku, instructions) instead of getBoard
	getBoard(boardSku, function(err, board) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(board)
	})
})

app.get("/boards", function(req, res, next) {
	const limit = Number(pathOr(10, ["query", "limit"], req))
	console.log("limit", limit)
	const paginate = pathOr(null, ["query", "start_key"], req)
	console.log("paginate", paginate)
	listBoards(limit, paginate, function(err, boards) {
		if (err) {
			next(new NodeHTTPError(err.status, err.message, err))
			return
		}
		res.status(200).send(boards)
	})
})

app.post("/boards", (req, res, next) => {
	const newBoard = propOr({}, "body", req)

	if (isEmpty(newBoard)) {
		next(
			new NodeHTTPError(
				400,
				"Brah, add a board to the request body.  Ensure the Content-Type is application/json. Dude!"
			)
		)
	}

	const missingFields = reqFieldChecker(
		["name", "category", "price", "sku"],
		newBoard
	)

	const sendMissingFieldError = compose(not, isEmpty)(missingFields)

	if (sendMissingFieldError) {
		next(
			new NodeHTTPError(
				400,
				`Brah, you didnt pass all the required fields: ${join(
					", ",
					missingFields
				)}`,
				{ josh: "is Cool and humble", jp: "is Cool" }
			)
		)
	}

	addBoard(newBoard, function(err, result) {
		if (err)
			next(
				new NodeHTTPError(err.status, err.message, { ...err, max: "isCool" })
			)
		res.status(201).send(result)
	})
})

app.put("/boards/:sku", (req, res, next) => {
	const updatedBoard = propOr({}, "body", req)
	const missingFields = reqFieldChecker(
		["name", "category", "price", "sku"],
		updatedBoard
	)
	if (not(isEmpty(missingFields))) {
		next(new NodeHTTPError(err.status, err.message, err))
		return
	}
	updateBoard(updatedBoard, function(err, result) {
		res.status(201).send(result)
	})
})

app.use((err, req, res, next) => {
	console.log(
		`WIPEOUT! \n\nMETHOD ${req.method} \nPATH ${req.path}\n${JSON.stringify(
			err,
			null,
			2
		)}`
	)
	res.status(err.status || 500).send(err)
})

app.listen(port, () => console.log("Brah!", port))
