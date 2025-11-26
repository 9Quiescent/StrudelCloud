using System;

namespace StrudelWebApp.Models
{
    public class StrudelPreset
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string RawCode { get; set; } = string.Empty;

        public string ControlsJson { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
