using GraphQL.Types;
using System;

public class CalcQuery : ObjectGraphType
{
    public static string SigningKey { get; set; }

    public CalcQuery()
    {
        Field<StringGraphType>(
            name: "awake",
            resolve: context => "Awake"
        );

        Field<StringGraphType>(
            name: "exit",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "signingkey" }
            ),
            resolve: context => {
                var signingkey = context.GetArgument<string>("signingkey");
                if (signingkey != SigningKey)
                {
                    return "error";
                }
                Environment.Exit(0);
                return "exit";
            }
        );

        Field<StringGraphType>(
            name: "hello",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "signingkey" }
            ),
            resolve: context => {
                var signingkey = context.GetArgument<string>("signingkey");
                if (signingkey != SigningKey)
                {
                    return "error";
                }
                return "world";
            }
        );

        Field<StringGraphType>(
            name: "calc",
            arguments: new QueryArguments(
                new QueryArgument<StringGraphType> { Name = "signingkey" },
                new QueryArgument<StringGraphType> { Name = "math" }
            ),
            resolve: context => {
                var signingkey = context.GetArgument<string>("signingkey");
                if (signingkey != SigningKey)
                {
                    return "error";
                }
                var math = context.GetArgument<string>("math");
                var result = Calc.Eval(math);
                return Convert.ToString(result);
            }
        );
    }
}
