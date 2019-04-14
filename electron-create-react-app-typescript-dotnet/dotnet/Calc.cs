using System;
using System.Collections.Generic;
using System.Text;

public static class Calc
{
  private static int getPrec(char c)
  {
    if ("+-".Contains(c))
    {
      return 1;
    }
    if ("*/".Contains(c))
    {
      return 2;
    }
    if ("^".Contains(c))
    {
      return 3;
    }
    return 0;
  }

  private static string getAssoc(char c)
  {
    if ("+-*/".Contains(c))
    {
      return "LEFT";
    }
    if ("^".Contains(c))
    {
      return "RIGHT";
    }
    return "LEFT";
  }

  private static double getBin(char op, double a, double b)
  {
    if (op == '+')
    {
      return a + b;
    }
    if (op == '-')
    {
      return a - b;
    }
    if (op == '*')
    {
      return a * b;
    }
    if (op == '/')
    {
      return a / b;
    }
    if (op == '^')
    {
      return Math.Pow(a,b);
    }
    return 0;
  }

  private static bool IsDigit(char c)
  {
    return "0123456789.".Contains(c);
  }

  public static double Eval(string s)
  {
    var numStk = new Stack<double>();
    var opStk = new Stack<char>();
    int i = 0;
    bool isUnary = true;
    while (i < s.Length)
    {
      while (i < s.Length && s[i] == ' ')
      {
        i += 1;
      }
      if (i >= s.Length)
      {
        break;
      }
      if (IsDigit(s[i]))
      {
        var num = new StringBuilder();
        while (i < s.Length && (IsDigit(s[i])))
        {
          num.Append(s[i]);
          i += 1;
        }
        numStk.Push(Convert.ToDouble(num.ToString()));
        isUnary = false;
        continue;
      }
      if ("+-*/^".Contains(s[i]))
      {
        if (isUnary)
        {
          opStk.Push('#');
        }
        else
        {
          while (opStk.Count > 0)
          {
            if ((getAssoc(s[i]) == "LEFT" && getPrec(s[i]) <= getPrec(opStk.Peek())) ||
              (getAssoc(s[i]) == "RIGHT" && getPrec(s[i]) < getPrec(opStk.Peek())))
            {
              var op = opStk.Pop();
              if (op == '#')
              {
                numStk.Push(-numStk.Pop());
              }
              else
              {
                var b = numStk.Pop();
                var a = numStk.Pop();
                numStk.Push(getBin(op, a, b));
              }
              continue;
            }
            break;
          }
          opStk.Push(s[i]);
        }
        isUnary = true;
      }
      else if (s[i] == '(')
      {
        opStk.Push(s[i]);
        isUnary = true;
      }
      else
      {
        while (opStk.Count > 0)
        {
          var op = opStk.Pop();
          if (op == '(')
          {
            break;
          }
          if (op == '#')
          {
            numStk.Push(-numStk.Pop());
          }
          else
          {
            var b = numStk.Pop();
            var a = numStk.Pop();
            numStk.Push(getBin(op, a, b));
          }
        }
      }
      i += 1;
    }
    while (opStk.Count > 0)
    {
      var op = opStk.Pop();
      if (op == '#')
      {
        numStk.Push(-numStk.Pop());
      }
      else
      {
        var b = numStk.Pop();
        var a = numStk.Pop();
        numStk.Push(getBin(op, a, b));
      }
    }
    return numStk.Pop();
  }
}