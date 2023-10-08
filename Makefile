OUTPUT_DIR := "./proto_gen"
PROTO_DIR := "../proto"

.PHONY: proto
proto:
	@mkdir -p $(OUTPUT_DIR)
	@npx grpc_tools_node_protoc \
		--js_out=import_style=commonjs,binary:${OUTPUT_DIR} \
		--grpc_out=grpc_js:${OUTPUT_DIR} \
		--plugin=protoc-gen-grpc=./node_modules/.bin/grpc_tools_node_protoc_plugin \
		-I $(PROTO_DIR) \
		$(PROTO_DIR)/*.proto
	@npx grpc_tools_node_protoc \
		--ts_out=grpc_js:${OUTPUT_DIR} \
		--plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
		-I $(PROTO_DIR) \
		$(PROTO_DIR)/*.proto
