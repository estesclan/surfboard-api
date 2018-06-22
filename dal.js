require("dotenv").config()
const PouchDB = require("pouchdb-core")
PouchDB.plugin(require("pouchdb-adapter-http"))

const { merge, prop, map } = require("ramda")
const pkGen = require("./lib/pk-gen")

const db = new PouchDB(
	`${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)

const getBoard = (boardSku, instructions) => db.get(boardSku, instructions)

const listBoards = (limit, paginate, callback) =>
	db.allDocs(
		paginate
			? { include_docs: true, limit, start_key: `${paginate}\ufff0` }
			: { include_docs: true, limit },
		function(err, result) {
			if (err) callback(err)
			callback(null, map(row => row.doc, result.rows))
		}
	)

const addBoard = (board, cb) => {
	const modifiedBoard = merge(board, {
		type: "board",
		_id: pkGen("board_", "-", prop("sku", board))
	})
	db.put(modifiedBoard, cb)
}

const updateBoard = (board, instructions) => db.put(board, instructions)

const deleteBoard = (board, instructions) => db.remove(board, instructions)

module.exports = { addBoard, getBoard, listBoards, updateBoard, deleteBoard }
