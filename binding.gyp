{
  "targets": [
    {
      "target_name": "llamacpp-bindings",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "src/llamacpp-bindings.cc" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': ['NAPI_DISABLE_CPP_EXCEPTIONS'],
    }
  ]
}