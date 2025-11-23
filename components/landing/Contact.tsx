// @ts-nocheck
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

export const Contact = () => {
  return (
    <section className="py-20 bg-white" id="contact">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              CONTACT US
            </h2>
          </div>

          <div className="bg-white rounded-xl p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder=""
                  className="w-full border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder=""
                  className="w-full border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Input
                  type="text"
                  placeholder=""
                  className="w-full border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  placeholder=""
                  className="w-full min-h-[150px] border-gray-300"
                />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Submit
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};