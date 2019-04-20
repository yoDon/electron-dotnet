using System;
using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.CommandLineUtils;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace dotnetcore
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var app = new CommandLineApplication(throwOnUnexpectedArg: false);
            var optionSigningKey = app.Option("--signingkey <SigningKey>", "Signing Key", CommandOptionType.SingleValue);
            var optionApiPort = app.Option("--apiport <PORT>", "Port number", CommandOptionType.SingleValue);
            app.HelpOption("--help");
            app.OnExecute(() => {
                var signingKey = optionSigningKey.HasValue() ? optionSigningKey.Value() : "";
                if (string.IsNullOrEmpty(signingKey))
                {
                    Console.Write("\nNo Signing Key\n");
                    Environment.Exit(1);
                }
                var apiPort = optionApiPort.HasValue() ? Int32.Parse(optionApiPort.Value()) : 5000;
                CalcQuery.IsDevMode = (apiPort == 5000);
                CalcQuery.SigningKey = signingKey;
                var directory = Directory.GetCurrentDirectory();
                var host = new WebHostBuilder()
                    .UseKestrel()
                    .UseIISIntegration()
                    .UseContentRoot(directory)
                    .UseStartup<Startup>()
                    .UseUrls(string.Format("http://localhost:{0}", apiPort))
                    .Build();
                host.Run();
                return 0;
            });
            app.Execute(args);
        }
    }
}
