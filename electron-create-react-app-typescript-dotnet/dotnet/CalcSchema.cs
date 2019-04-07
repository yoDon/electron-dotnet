using GraphQL;
using GraphQL.Types;

public class CalcSchema : Schema
{
    public CalcSchema(IDependencyResolver resolver)
        :base(resolver)
    {
        Query = resolver.Resolve<CalcQuery>();
    }
}