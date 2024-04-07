#include <napi.h>
#include <common.h>
#include <llama.h>

using namespace Napi;

Napi::Value systemInfo(const Napi::CallbackInfo &info)
{
    return Napi::String::From(info.Env(), llama_print_system_info());
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
Napi:
    String name = Napi::String::New(env, "systemInfo");
    exports.Set(name, Napi::Function::New(env, systemInfo));
    return exports;
}

NODE_API_MODULE(addon, Init)