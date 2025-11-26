using System;
using System.ComponentModel.DataAnnotations;

namespace StrudelWebApp.Models
{
    public class StrudelPreset
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required] 
        public string RawCode { get; set; } = string.Empty;

        [Required] 
        public string ControlsJson { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; }
    }
}
